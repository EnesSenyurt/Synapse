"""Pydantic models for the LLM task-parser service."""

from pydantic import BaseModel, Field


class Subtask(BaseModel):
    """A single subtask produced by decomposing a higher-level goal."""

    id: str = Field(description="Stable, unique identifier for this subtask (short snake_case).")
    title: str = Field(description="Concise, human-readable name of the subtask.")
    depends_on: list[str] = Field(
        default_factory=list,
        description="IDs of subtasks that must complete before this one can start.",
    )


class ParseResponse(BaseModel):
    """Structured response returned by Gemini: the full list of decomposed subtasks."""

    subtasks: list[Subtask]
