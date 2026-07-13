"""Thin wrapper around Google Gemini Flash for task decomposition.

Uses the unified `google-genai` SDK with structured output: we hand Gemini the
Pydantic `ParseResponse` schema so the model returns already-valid JSON and we
skip the usual markdown-fence stripping / ad-hoc cleanup.
"""

import os

from google import genai
from google.genai import types

from models import ParseResponse

MODEL_NAME = "gemini-flash-latest"

SYSTEM_INSTRUCTION = """You are a task decomposition assistant.

Given a high-level goal written in natural language, break it down into a
directed acyclic graph (DAG) of concrete, actionable subtasks.

Rules:
- Each subtask has a unique `id` (short snake_case, e.g. "setup_db").
- Each subtask has a clear, imperative `title` (e.g. "Set up the database").
- Use `depends_on` to list ids of subtasks that MUST finish before this one starts.
- The dependency graph MUST be acyclic — never introduce a cycle.
- Prefer 4-10 subtasks. Only produce fewer if the goal is genuinely trivial.
- Order subtasks so earlier ones are prerequisites for later ones.
- Every id in `depends_on` MUST refer to another subtask you produced.
- Respond in the same natural language as the user's request when possible.
"""


def parse_task(description: str) -> ParseResponse:
    """Call Gemini Flash to decompose `description` into a DAG of subtasks.

    Raises RuntimeError on missing API key, API failure, or unparsable response.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=description,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ParseResponse,
            ),
        )
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}") from e

    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, ParseResponse):
        return parsed

    try:
        return ParseResponse.model_validate_json(response.text)
    except Exception as e:
        raise RuntimeError(f"Failed to parse Gemini response as ParseResponse: {e}") from e
