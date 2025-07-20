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

import os

import google.auth
import vertexai
from google import genai
from google.genai import types

# Constants
VERTEXAI = os.getenv("VERTEXAI", "true").lower() == "true"
LOCATION = "us-central1"
MODEL_ID = "gemini-live-2.5-flash-preview-native-audio"

# Initialize Google Cloud clients
credentials, project_id = google.auth.default()
vertexai.init(project=project_id, location=LOCATION)

if VERTEXAI:
    genai_client = genai.Client(project=project_id, location=LOCATION, vertexai=True)
else:
    # API key should be set using GOOGLE_API_KEY environment variable
    genai_client = genai.Client(http_options={"api_version": "v1alpha"})


def get_school_info(school_name: str) -> dict:
    """Get information about a specific business school.

    Args:
        school_name: The name of the business school to get information about.

    Returns:
        A dictionary with school information and interview insights.
    """
    school_insights = {
        "harvard business school": {
            "focus": "leadership excellence, analytical thinking, and collaborative mindset",
            "values": "excellence, integrity, respect, accountability, and service",
            "culture": "case method learning, collaborative leadership development"
        },
        "stanford graduate school of business": {
            "focus": "entrepreneurial thinking, innovation, and social impact",
            "values": "intellectual vitality, engaged community, personal leadership",
            "culture": "innovation, risk-taking, social responsibility"
        },
        "wharton school": {
            "focus": "analytical rigor, quantitative skills, and global perspective",
            "values": "knowledge for action, integrity, global citizenship",
            "culture": "analytical excellence, finance leadership, team collaboration"
        }
    }
    
    school_key = school_name.lower()
    if school_key in school_insights:
        return {"output": f"School insights: {school_insights[school_key]}"}
    
    return {"output": "General MBA insights: Focus on leadership, teamwork, and analytical thinking."}


def take_interview_notes(observation: str) -> dict:
    """Take notes during the interview for evaluation purposes.

    Args:
        observation: Important observation or insight about the candidate's response.

    Returns:
        Confirmation that the note was recorded.
    """
    # In a real implementation, this would save to the database
    return {"output": f"Note recorded: {observation}"}


# Configure tools available to the MBA interview agent
tool_functions = {
    "get_school_info": get_school_info,
    "take_interview_notes": take_interview_notes
}

# Create tool declarations for the LiveConnectConfig
tool_declarations = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="get_school_info",
                description="Get information about a specific business school",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "school_name": types.Schema(
                            type=types.Type.STRING,
                            description="The name of the business school to get information about"
                        )
                    },
                    required=["school_name"]
                )
            ),
            types.FunctionDeclaration(
                name="take_interview_notes",
                description="Take notes during the interview for evaluation purposes",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "observation": types.Schema(
                            type=types.Type.STRING,
                            description="Important observation or insight about the candidate's response"
                        )
                    },
                    required=["observation"]
                )
            )
        ]
    )
]

# MBA Interview System Instruction Template - will be dynamically injected with school persona
MBA_INTERVIEW_SYSTEM_INSTRUCTION = """You are an expert MBA admissions interviewer conducting a natural, conversational interview.

PERSONA: {persona_context}

SCHOOL CONTEXT: {school_context}

TONE: {tone}

BEHAVIORAL GUIDELINES: {behavioral_notes}

CONVERSATION FLOW:
1. Start with this greeting: "{greeting}"
2. Ask thoughtful follow-up questions based on candidate responses
3. Explore leadership experiences, analytical thinking, and cultural fit
4. Maintain natural conversation flow - don't follow a rigid script
5. End with: "{closing}"

EVALUATION CRITERIA:
- Communication Skills (25%) - clarity, articulation, engagement
- Leadership Potential (25%) - examples of leadership and influence  
- Analytical Thinking (25%) - problem-solving and strategic reasoning
- Cultural Fit (25%) - alignment with school values and community

CONVERSATION GUIDELINES:
- Ask one question at a time
- Listen actively to responses
- Ask relevant follow-ups based on what the candidate shares
- Keep the interview natural and conversational
- Be professional yet warm and supportive
- Use the take_interview_notes tool to record key observations

QUESTION BANK CONTEXT: {questions_context}

NOTE: This is a LIVE AUDIO conversation. Respond naturally as if speaking to the candidate in person.
"""

# Default configuration - will be updated dynamically
live_connect_config = types.LiveConnectConfig(
    response_modalities=[types.Modality.AUDIO],
    tools=tool_declarations,
    system_instruction=types.Content(
        parts=[
            types.Part(
                text=MBA_INTERVIEW_SYSTEM_INSTRUCTION.format(
                    persona_context="[PLACEHOLDER - Will be dynamically injected]",
                    school_context="[PLACEHOLDER - Will be dynamically injected]", 
                    tone="warm_professional",
                    behavioral_notes="[PLACEHOLDER - Will be dynamically injected]",
                    greeting="Hello! I'm excited to learn more about you and your interest in pursuing an MBA. Please tell me about yourself and what draws you to this program.",
                    closing="Thank you for this wonderful conversation. We'll be in touch soon with next steps in the admissions process.",
                    questions_context="[PLACEHOLDER - Will be dynamically injected]"
                )
            )
        ]
    ),
    speech_config=types.SpeechConfig(
        voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
        )
    ),
    enable_affective_dialog=True,
)


def create_personalized_config(persona_data: dict, questions_data: list) -> types.LiveConnectConfig:
    """Create a personalized live connect config based on school persona and questions."""
    
    # Extract persona information
    persona_context = f"You are {persona_data.get('interviewer_name', 'an MBA admissions interviewer')} - {persona_data.get('interviewer_title', 'Admissions Committee Member')}"
    school_context = persona_data.get('school_context', 'A top-tier business school focused on developing tomorrow\'s leaders')
    tone = persona_data.get('tone', 'warm_professional')
    behavioral_notes = persona_data.get('behavioral_notes', 'Be encouraging and supportive while maintaining professionalism')
    greeting = persona_data.get('greeting', 'Hello! I\'m excited to learn more about you and your interest in pursuing an MBA.')
    closing = persona_data.get('closing', 'Thank you for this wonderful conversation. We\'ll be in touch soon.')
    
    # Format questions context
    questions_context = "Consider these school-specific topics during the conversation: " + "; ".join([q.get('question_text', '') for q in questions_data[:5]])
    
    personalized_instruction = MBA_INTERVIEW_SYSTEM_INSTRUCTION.format(
        persona_context=persona_context,
        school_context=school_context,
        tone=tone,
        behavioral_notes=behavioral_notes,
        greeting=greeting,
        closing=closing,
        questions_context=questions_context
    )
    
    return types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        tools=tool_declarations,
        system_instruction=types.Content(
            parts=[types.Part(text=personalized_instruction)]
        ),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
            )
        ),
        enable_affective_dialog=True,
    )
