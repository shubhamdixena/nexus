Coding Agent guidance:
---
**llm.txt** documents the "Agent Starter Pack" repository, providing a source of truth on its purpose, features, and usage.
---

### Section 1: Project Overview

*   **Project Name:** Agent Starter Pack
*   **Purpose:** Accelerate development of production-ready GenAI Agents on Google Cloud.
*   **Tagline:** Production-Ready Agents on Google Cloud, faster.

**The "Production Gap":**
While prototyping GenAI agents is quick, production deployment often takes 3-9 months.

**Key Challenges Addressed:**
*   **Customization:** Business logic, data grounding, security/compliance.
*   **Evaluation:** Metrics, quality assessment, test datasets.
*   **Deployment:** Cloud infrastructure, CI/CD, UI integration.
*   **Observability:** Performance tracking, user feedback.

**Solution: Agent Starter Pack**
Provides MLOps and infrastructure templates so developers focus on agent logic.

*   **You Build:** Prompts, LLM interactions, business logic, agent orchestration.
*   **We Provide:**
    *   Deployment infrastructure, CI/CD, testing
    *   Logging, monitoring
    *   Evaluation tools
    *   Data connections, UI playground
    *   Security best practices

Establishes production patterns from day one, saving setup time.

---
### Section 2: Creating a New Agent Project

Start by creating a new agent project from a predefined template. This process supports both interactive and fully automated setup.

**Prerequisites:**
Before you begin, ensure you have `uv`/`uvx`, `gcloud` CLI, `terraform`, `git`, and `gh` CLI (for automated CI/CD setup) installed and authenticated.

**Installing the `agent-starter-pack` CLI:**
Choose one method to get the `agent-starter-pack` command:

1.  **`uvx` (Recommended for Zero-Install/Automation):** Run directly without prior installation.
    ```bash
    uvx agent-starter-pack create ...
    ```
2.  **Virtual Environment (`pip` or `uv`):**
    ```bash
    pip install agent-starter-pack
    ```
3.  **Persistent CLI Install (`pipx` or `uv tool`):** Installs globally in an isolated environment.

---
### `agent-starter-pack create` Command

Generates a new agent project directory based on a chosen template and configuration.

**Usage:**
```bash
agent-starter-pack create PROJECT_NAME [OPTIONS]
```

**Arguments:**
*   `PROJECT_NAME`: Name for your new project directory and base for GCP resource naming.

**Key Options:**
*   `-a, --agent`: Agent template (e.g., `adk_base`, `agentic_rag`).
*   `-d, --deployment-target`: Target deployment environment (`cloud_run` or `agent_engine`).
*   `-ds, --datastore`: For RAG agents, the datastore (`vertex_ai_search` or `vertex_ai_vector_search`).
*   `-i, --include-data-ingestion`: Include data ingestion pipeline scaffolding.
*   `--session-type`: For agents requiring session management on Cloud Run, specifies the storage type (`in_memory` or `alloydb`).
*   `--region`: GCP region (e.g., `us-central1`).
*   `--auto-approve`: **Skips all interactive prompts (crucial for automation).**
*   `--debug`: Enables debug logging during creation.

**Automated Creation Example:**
```bash
uvx agent-starter-pack create my-automated-agent \
  -a adk_base \
  -d cloud_run \
  --region us-central1 \
  --auto-approve
```

---

### Available Agent Templates

Templates for the `create` command (via `-a` or `--agent`):

| Agent Name             | Description                                  |
| :--------------------- | :------------------------------------------- |
| `adk_base`             | Base ReAct agent (ADK)                       |
| `adk_gemini_fullstack` | Production-ready fullstack research agent    |
| `agentic_rag`          | RAG agent for document retrieval & Q&A       |
| `langgraph_base_react` | Base ReAct agent (LangGraph)                 |
| `crewai_coding_crew`   | Multi-agent collaborative coding assistance  |
| `live_api`             | Real-time multimodal RAG agent               |

---

### Including a Data Ingestion Pipeline (for RAG agents)

For RAG agents needing custom document search, enabling this option automates loading, chunking, embedding documents with Vertex AI, and storing them in a vector database.

**How to enable:**
```bash
uvx agent-starter-pack create my-rag-agent \
  -a agentic_rag \
  -d cloud_run \
  -i \
  -ds vertex_ai_search \
  --auto-approve
```
**Post-creation:** Follow your new project's `data_ingestion/README.md` to deploy the necessary infrastructure.

---
### Section 3: Development & Automated Deployment Workflow
---

This section describes the end-to-end lifecycle of an agent, with emphasis on automation.


### 1. Local Development & Iteration

Once your project is created, navigate into its directory to begin development.

**First, install dependencies (run once):**
```bash
make install
```

**Next, test your agent. The recommended method is to use a programmatic script.**

#### Programmatic Testing (Recommended Workflow)

This method allows for quick, automated validation of your agent's logic.

1.  **Create a script:** In the project's root directory, create a Python script named `run_agent.py`.
2.  **Invoke the agent:** In the script, write code to programmatically call your agent with sample input and `print()` the output for inspection.
    *   **Guidance:** If you're unsure or no guidance exists, you can look at files in the `tests/` directory for examples of how to import and call the agent's main function.
    *   **Important:** This script is for simple validation. **Assertions are not required**, and you should not create a formal `pytest` file.
3.  **Run the test:** Execute your script from the terminal using `uv`.
    ```bash
    uv run python run_agent.py
    ```
You can keep the test file for future testing.

#### Manual Testing with the UI Playground (Optional)

If the user needs to interact with your agent manually in a chat interface for debugging:

1.  Run the following command to start the local web UI:
    ```bash
    make playground
    ```
    This is useful for human-in-the-loop testing and features hot-reloading.

### 2. Deploying to a Cloud Development Environment
Before setting up full CI/CD, you can deploy to a personal cloud dev environment.

1.  **Set Project:** `gcloud config set project YOUR_DEV_PROJECT_ID`
2.  **Provision Resources:** `make setup-dev-env` (uses Terraform).
3.  **Deploy Backend:** `make backend` (builds and deploys the agent).

### 3. Automated Production-Ready Deployment with CI/CD
For reliable deployments, the `setup-cicd` command streamlines the entire process. It creates a GitHub repo, connects it to Cloud Build, provisions staging/prod infrastructure, and configures deployment triggers.

**Automated CI/CD Setup Example (Recommended):**
```bash
# Run from the project root. This command will guide you or can be automated with flags.
uvx agent-starter-pack setup-cicd
```

**CI/CD Workflow Logic:**
*   **On Pull Request:** CI pipeline runs tests.
*   **On Merge to `main`:** CD pipeline deploys to staging.
*   **Manual Approval:** A manual approval step triggers the production deployment.

---
### Section 4: Key Features & Customization
---

### Deploying with a User Interface (UI)
*   **Unified Deployment (for Dev/Test):** The backend and frontend can be packaged and served from a single Cloud Run service, secured with Identity-Aware Proxy (IAP).
*   **Deploying with UI:** `make backend IAP=true`
*   **Access Control:** After deploying with IAP, grant users the `IAP-secured Web App User` role in IAM to give them access.

### Session Management

For stateful agents, the starter pack supports persistent sessions.
*   **Cloud Run:** Choose between `in_memory` (for testing) and durable `alloydb` sessions using the `--session-type` flag.
*   **Agent Engine:** Provides session management automatically.

### Monitoring & Observability
*   **Technology:** Uses OpenTelemetry to emit events to Google Cloud Trace and Logging.
*   **Custom Tracer:** A custom tracer in `app/utils/tracing.py` handles large payloads by linking to GCS, overcoming default service limits.
*   **Infrastructure:** A Log Router to sink data to BigQuery is provisioned by Terraform.

---
### Section 5: CLI Reference for CI/CD Setup
---

### `agent-starter-pack setup-cicd`
Automates the entire CI/CD setup for a project on GitHub.

**Usage:**
```bash
uvx agent-starter-pack setup-cicd [OPTIONS]
```
**Prerequisites:** Run from the project root. `uv`, `gh` CLI, `gcloud` CLI, and `terraform` must be installed and authenticated. Requires `Owner` role on the GCP projects.

**Automated CI/CD Setup Options:**
*   `--staging-project`: (REQUIRED) The Google Cloud Project ID for your staging environment.
*   `--prod-project`: (REQUIRED) The Google Cloud Project ID for your production environment.
*   `--repository-name`: (REQUIRED) The name for the new GitHub repository that will be created.
*   `--repository-owner`: (REQUIRED) Your GitHub username or organization where the repo will be created.
*   `--git-provider`: (REQUIRED) The Git provider to use (github, gitlab, etc.). Only "github" is supported. 
*   `--auto-approve`: Skips all interactive confirmation prompts.


**Automated Example:**
```bash
uvx agent-starter-pack setup-cicd \
  --staging-project the-user-staging-project \
  --prod-project the-user-prod-project \
  --repository-name the-user-repo-name \
  --repository-owner the-username \
  --git-provider github \
  --auto-approve
```
* Note: As a coding agent, you must run this command non-interactively. Before executing, you must ask the user to provide the following required flags: `--staging-project`, `--prod-project`, `--repository-name`, `--repository-owner`, and `--git-provider`. Once you have these values, you can construct and run the command with the `--auto-approve` flag.
* Note: If the user tells that `setup-cicd` is not a viable option or it wants to use a different git provider, you must not use this command. Instead, you should look at the `deployment/README.md` to get instructions on how to manually deploy the agent.
---
### Section 6: Operational Guidelines for Coding Agents

These guidelines are essential for interacting with the Agent Starter Pack project effectively.

---

### Principle 1: Code Preservation & Isolation

When executing code modifications using tools like `replace` or `write_file`, your paramount objective is surgical precision. You **must alter only the code segments directly targeted** by the user's request, while **strictly preserving all surrounding and unrelated code.**

**Mandatory Pre-Execution Verification:**

Before finalizing any `new_string` for a `replace` operation, meticulously verify the following:

1.  **Target Identification:** Clearly define the exact lines or expressions to be changed, based *solely* on the user's explicit instructions.
2.  **Preservation Check:** Compare your proposed `new_string` against the `old_string`. Ensure all code, configuration values (e.g., `model`, `version`, `api_key`), comments, and formatting *outside* the identified target remain identical and verbatim.

**Example: Adhering to Preservation**

*   **User Request:** "Change the agent's instruction to be a recipe suggester."
*   **Original Code Snippet:**
    ```python
    root_agent = Agent(
        name="root_agent",
        model="gemini-2.5-flash",
        instruction="You are a helpful AI assistant."
    )
    ```
*   **Incorrect Modification (VIOLATION):**
    ```python
    root_agent = Agent(
        name="recipe_suggester",
        model="gemini-1.5-flash", # UNINTENDED MUTATION - model was not requested to change
        instruction="You are a recipe suggester."
    )
    ```
*   **Correct Modification (COMPLIANT):**
    ```python
    root_agent = Agent(
        name="recipe_suggester", # OK, related to new purpose
        model="gemini-2.5-flash", # MUST be preserved
        instruction="You are a recipe suggester." # OK, the direct target
    )
    ```

**Critical Error:** Failure to adhere to this preservation principle is a critical error. Always prioritize the integrity of existing, unchanged code over the convenience of rewriting entire blocks.

---

### Principle 2: Workflow & Execution Best Practices

*   **Standard Workflow:**
    The validated end-to-end process is: `create` → `test` → `setup-cicd` → push to deploy. Trust this high-level workflow as the default for developing and shipping agents.

*   **Agent Testing:**
    *   **Avoid `make playground`** unless specifically instructed; it is designed for human interaction. Focus on programmatic testing.

*   **Model Selection:**
    *   **When using Gemini, prefer the 2.5 model family** for optimal performance and capabilities: "gemini-2.5-pro" and "gemini-2.5-flash"

*   **Running Python Commands:**
    *   Always use `uv` to execute Python commands within this repository (e.g., `uv run run_agent.py`).
    *   Ensure project dependencies are installed by running `make install` before executing scripts.
    *   Consult the project's `Makefile` and `README.md` for other useful development commands.

*   **Further Reading & Troubleshooting:**
    *   For questions about specific frameworks (e.g., LangGraph) or Google Cloud products (e.g., Cloud Run), their official documentation and online resources are the best source of truth.
    *   **When encountering persistent errors or if you're unsure how to proceed after initial troubleshooting, a targeted Google Search is strongly recommended.** It is often the fastest way to find relevant documentation, community discussions, or direct solutions to your problem.
