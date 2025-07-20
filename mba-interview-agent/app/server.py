# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import asyncio
import json
import logging
import os
import re
import uuid
from collections.abc import Callable
from typing import Any, Literal

import backoff
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import logging as google_cloud_logging
from google.genai import types
from google.genai.types import LiveServerToolCall
from pydantic import BaseModel
from websockets.exceptions import ConnectionClosedError
import asyncpg
from datetime import datetime
from urllib.parse import urlparse

from app.agent import MODEL_ID, genai_client, live_connect_config, tool_functions, create_personalized_config

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
logging_client = google_cloud_logging.Client()
logger = logging_client.logger(__name__)
logging.basicConfig(level=logging.INFO)

# Database connection pool
db_pool = None

async def get_db_connection():
    """Get database connection from pool."""
    global db_pool
    if db_pool is None:
        # Parse DATABASE_URL from environment or construct from Supabase URL
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
            db_password = os.getenv("SUPABASE_DB_PASSWORD", "")
            
            if supabase_url and db_password:
                # Parse Supabase URL to extract connection details
                parsed = urlparse(supabase_url)
                if parsed.hostname:
                    # Extract project reference from hostname (e.g., "abcdef.supabase.co")
                    project_ref = parsed.hostname.split('.')[0]
                    # Construct database hostname
                    db_host = f"db.{project_ref}.supabase.co"
                    database_url = f"postgresql://postgres:{db_password}@{db_host}:5432/postgres"
                else:
                    raise ValueError("Invalid NEXT_PUBLIC_SUPABASE_URL format")
            else:
                raise ValueError("Database connection configuration missing. Please set DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD")
        
        try:
            db_pool = await asyncpg.create_pool(
                database_url, 
                min_size=1, 
                max_size=10,
                command_timeout=30,
                server_settings={
                    'jit': 'off',  # Disable JIT for better compatibility
                    'application_name': 'mba_interview_agent'
                }
            )
            logging.info("Database connection pool created successfully")
        except Exception as e:
            logging.error(f"Failed to create database connection pool: {e}")
            # Set pool to None so we can try again later
            db_pool = None
            raise
    
    return await db_pool.acquire()

# Input validation patterns
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"you\s+are\s+now\s+a",
    r"forget\s+your\s+role",
    r"new\s+system\s+prompt",
    r"act\s+as\s+if",
    r"pretend\s+to\s+be",
    r"roleplay\s+as",
]

def validate_input(text: str) -> bool:
    """Validate user input to prevent prompt injection attacks."""
    if not text or len(text.strip()) == 0:
        return False
    
    # Check for prompt injection patterns
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            logging.warning(f"Potential prompt injection detected: {pattern}")
            return False
    
    # Basic length and content checks
    if len(text) > 10000:  # Prevent extremely long inputs
        return False
    
    return True

async def get_school_persona_and_questions(school_id: str) -> tuple[dict, list]:
    """Fetch school persona and questions from database."""
    try:
        conn = await get_db_connection()
        try:
            # Get school persona
            persona_query = """
                SELECT * FROM ai_interview_school_personas 
                WHERE school_id = $1 AND is_active = true 
                LIMIT 1
            """
            persona_row = await conn.fetchrow(persona_query, school_id)
            
            # Get school questions
            questions_query = """
                SELECT * FROM ai_interview_question_banks 
                WHERE school_id = $1 AND is_active = true 
                ORDER BY priority DESC LIMIT 10
            """
            questions_rows = await conn.fetch(questions_query, school_id)
            
            persona_data = dict(persona_row) if persona_row else {}
            questions_data = [dict(row) for row in questions_rows] if questions_rows else []
            
            return persona_data, questions_data
            
        finally:
            await db_pool.release(conn)
        
    except Exception as e:
        logging.error(f"Failed to fetch school data: {e}")
        # Return default data
        return {
            'interviewer_name': 'MBA Admissions Interviewer',
            'interviewer_title': 'Admissions Committee Member',
            'tone': 'warm_professional',
            'greeting': 'Hello! I\'m excited to learn more about you and your interest in pursuing an MBA.',
            'closing': 'Thank you for this wonderful conversation. We\'ll be in touch soon.',
            'school_context': 'A top-tier business school focused on developing tomorrow\'s leaders',
            'behavioral_notes': 'Be encouraging and supportive while maintaining professionalism'
        }, []

async def create_interview_session(user_id: str, school_id: str, context: dict) -> str:
    """Create a new interview session in database."""
    try:
        session_id = str(uuid.uuid4())
        conn = await get_db_connection()
        try:
            await conn.execute("""
                INSERT INTO ai_interview_agent_sessions 
                (id, user_id, school_id, status, persona_used, questions_context, 
                 started_at, user_agent, ip_address)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """, session_id, user_id, school_id, 'active', 
                json.dumps(context.get('persona_data', {})),
                json.dumps(context.get('questions_data', [])),
                datetime.utcnow(),
                context.get('user_agent', ''),
                context.get('ip_address', ''))
            
            return session_id
        finally:
            await db_pool.release(conn)
            
    except Exception as e:
        logging.error(f"Failed to create interview session: {e}")
        # Return a temporary session ID
        return f"temp_session_{uuid.uuid4()}"

async def save_conversation_turn(session_id: str, turn_number: int, speaker: str, message: str, metadata: dict = None):
    """Save a conversation turn to database."""
    try:
        conn = await get_db_connection()
        try:
            await conn.execute("""
                INSERT INTO ai_interview_conversation_turns 
                (session_id, turn_number, speaker, message_text, message_metadata, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, session_id, turn_number, speaker, message, 
                json.dumps(metadata or {}), datetime.utcnow())
        finally:
            await db_pool.release(conn)
        
    except Exception as e:
        logging.error(f"Failed to save conversation turn: {e}")

async def update_session_completion(session_id: str, total_turns: int, duration_seconds: int):
    """Update session completion status in database."""
    try:
        conn = await get_db_connection()
        try:
            await conn.execute("""
                UPDATE ai_interview_agent_sessions 
                SET status = $1, total_turns = $2, duration_seconds = $3, 
                    completed_at = $4, completion_percentage = $5
                WHERE id = $6
            """, 'completed', total_turns, duration_seconds, 
                datetime.utcnow(), 100, session_id)
        finally:
            await db_pool.release(conn)
            
    except Exception as e:
        logging.error(f"Failed to update session completion: {e}")


class GeminiSession:
    """Manages bidirectional communication between a client and the Gemini model."""

    def __init__(
        self, session: Any, websocket: WebSocket, tool_functions: dict[str, Callable]
    ) -> None:
        """Initialize the Gemini session.

        Args:
            session: The Gemini session
            websocket: The client websocket connection
            tool_functions: Dictionary of available tool functions
        """
        self.session = session
        self.websocket = websocket
        self.run_id = "n/a"
        self.user_id = "n/a"
        self.school_id = None
        self.interview_session_id = None
        self.tool_functions = tool_functions
        self._tool_tasks: list[asyncio.Task] = []
        self.turn_counter = 0
        self.session_start_time = datetime.utcnow()

    async def receive_audio_from_client(self) -> None:
        """Listen for and process audio messages from the client."""
        try:
            while True:
                audio_chunk = await self.websocket.receive_bytes()
                # Directly forward the raw audio bytes to Gemini
                await self.session._ws.send(audio_chunk)
        except ConnectionClosedError as e:
            logging.warning(f"Client {self.user_id} closed connection: {e}")
            await self._cleanup_session()
        except Exception as e:
            logging.error(f"Error receiving audio from client {self.user_id}: {e!s}")
            # The break is implicit, as the gather call in the endpoint will terminate.

    async def _post_connection_setup(self, setup_data: dict, persona_data: dict, questions_data: list):
        """Handle setup tasks after connection and personalization."""
        self.run_id = setup_data.get("run_id", "n/a")
        self.user_id = setup_data.get("user_id", "n/a")
        
        context = setup_data.get("context", {})
        self.school_id = context.get("school_id")
        
        if self.school_id:
            # Create interview session in database
            session_context = {
                'persona_data': persona_data,
                'questions_data': questions_data,
                'user_agent': context.get('user_agent', ''),
                'ip_address': context.get('ip_address', '')
            }
            self.interview_session_id = await create_interview_session(
                self.user_id, self.school_id, session_context
            )
            
            # Send initial greeting through the session
            greeting_message = persona_data.get('greeting', 'Hello! I\'m excited to learn more about you.')
            await self.session.send(
                types.LiveServerMessage(
                    server_content=types.ServerContent(
                        model_turn=types.ModelTurn(parts=[types.Part(text=greeting_message)])
                    )
                )
            )
            logging.info(f"Successfully sent personalized greeting for school {self.school_id}")
        
        logger.log_struct(
            {**setup_data, "type": "setup", "interview_session_id": self.interview_session_id}, 
            severity="INFO"
        )

    async def _cleanup_session(self):
        """Clean up session when connection ends."""
        if self.interview_session_id:
            duration = (datetime.utcnow() - self.session_start_time).total_seconds()
            await update_session_completion(
                self.interview_session_id, 
                self.turn_counter, 
                int(duration)
            )

    def _get_func(self, action_label: str | None) -> Callable | None:
        """Get the tool function for a given action label."""
        if action_label is None or action_label == "":
            return None
        return self.tool_functions.get(action_label)

    async def _handle_tool_call(
        self, session: Any, tool_call: LiveServerToolCall
    ) -> None:
        """Process tool calls from Gemini and send back responses."""
        if tool_call.function_calls is None:
            logging.debug("No function calls in tool_call")
            return

        for fc in tool_call.function_calls:
            logging.debug(f"Calling tool function: {fc.name} with args: {fc.args}")
            func = self._get_func(fc.name)
            if func is None:
                logging.error(f"Function {fc.name} not found")
                continue
            args = fc.args if fc.args is not None else {}

            # Handle both async and sync functions appropriately
            if asyncio.iscoroutinefunction(func):
                # Function is already async
                response = await func(**args)
            else:
                # Run sync function in a thread pool to avoid blocking
                response = await asyncio.to_thread(func, **args)

            tool_response = types.LiveClientToolResponse(
                function_responses=[
                    types.FunctionResponse(name=fc.name, id=fc.id, response=response)
                ]
            )
            logging.debug(f"Tool response: {tool_response}")
            await session.send(input=tool_response)


    async def receive_from_gemini(self) -> None:
        """Listen for and process messages from Gemini without blocking."""
        try:
            async for result in self.session:
                # Forward the raw message bytes to the client
                await self.websocket.send_bytes(result.model_dump_json(exclude_none=True).encode("utf-8"))
                
                # Also, process the message for tool calls and logging
                if result.tool_call:
                    tool_call = LiveServerToolCall.model_validate(result.tool_call)
                    task = asyncio.create_task(
                        self._handle_tool_call(self.session, tool_call)
                    )
                    self._tool_tasks.append(task)
                
                if result.server_content and result.server_content.turn_complete and self.interview_session_id:
                    model_turn = result.server_content.model_turn
                    if model_turn:
                        self.turn_counter += 1
                        turn_text = "".join(part.text for part in model_turn.parts if part.text)
                        
                        if turn_text.strip():
                            await save_conversation_turn(
                                self.interview_session_id,
                                self.turn_counter,
                                "agent",
                                turn_text,
                                {"response_id": str(uuid.uuid4())}
                            )
                            
        except Exception as e:
            logging.error(f"Error in receive_from_gemini: {e!s}", exc_info=True)
            if not self.websocket.client_state == 'DISCONNECTED':
                await self.websocket.close(code=1011, reason="Internal server error")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """Handle new websocket connections."""
    await websocket.accept()
    session = None
    gemini_session = None
    
    try:
        # Phase 1: Receive and process the setup message to configure the session.
        setup_data = await websocket.receive_json()
        if "setup" not in setup_data:
            logging.error("Protocol Error: First message was not 'setup'.")
            await websocket.close(code=1002, reason="Protocol Error")
            return

        setup_info = setup_data["setup"]
        context = setup_info.get("context", {})
        school_id = context.get("school_id")

        persona_data, questions_data = {}, []
        if school_id:
            persona_data, questions_data = await get_school_persona_and_questions(school_id)
            config = create_personalized_config(persona_data, questions_data)
        else:
            # Fallback to default configuration if no school_id is provided
            config = live_connect_config
            logging.warning("No school_id provided, using default config.")

        # Phase 2: Connect to Gemini with the appropriate configuration.
        async with genai_client.aio.live.connect(model=MODEL_ID, config=config) as session:
            await websocket.send_json({"type": "status", "message": "Agent connected. Ready for audio."})
            
            gemini_session = GeminiSession(
                session=session, websocket=websocket, tool_functions=tool_functions
            )
            
            await gemini_session._post_connection_setup(setup_info, persona_data, questions_data)

            # Phase 3: Start bidirectional streaming.
            logging.info("Starting bidirectional communication.")
            await asyncio.gather(
                gemini_session.receive_audio_from_client(),
                gemini_session.receive_from_gemini(),
            )

    except ConnectionClosedError:
        logging.warning("Client closed connection.")
        if gemini_session:
            await gemini_session._cleanup_session()
    except Exception as e:
        logging.error(f"An error occurred in the websocket endpoint: {e!s}", exc_info=True)
        if not websocket.client_state == 'DISCONNECTED':
            await websocket.close(code=1011, reason="Internal Server Error")
        if gemini_session:
            await gemini_session._cleanup_session()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "mba-interview-agent",
        "timestamp": datetime.utcnow().isoformat()
    }


class FeedbackRequest(BaseModel):
    run_id: str
    user_id: str
    rating: Literal["thumbs_up", "thumbs_down"]
    comment: str = ""


@app.post("/feedback")
async def log_feedback(feedback: FeedbackRequest) -> dict[str, str]:
    """Log user feedback."""
    logger.log_struct(
        {
            "type": "feedback",
            "run_id": feedback.run_id,
            "user_id": feedback.user_id,
            "rating": feedback.rating,
            "comment": feedback.comment,
        },
        severity="INFO",
    )
    return {"status": "logged"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
