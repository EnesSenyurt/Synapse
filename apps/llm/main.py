"""FastAPI entry point for the Synapse LLM task-parser service.

POST /parse-task takes a natural-language description, asks Gemini Flash to
decompose it into a subtask DAG, validates the graph, and returns React Flow
nodes/edges ready to drop onto the frontend canvas.
"""

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from graph_utils import detect_cycle, to_react_flow
from llm_service import parse_task

load_dotenv()

app = FastAPI(title="Synapse LLM Task Parser", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParseRequest(BaseModel):
    """Request body for POST /parse-task."""

    description: str = Field(description="Natural-language goal to decompose.")


@app.get("/health")
def health() -> dict:
    """Liveness probe."""
    return {"status": "ok"}


@app.post("/parse-task")
def parse_task_endpoint(req: ParseRequest) -> dict:
    """Decompose a task via Gemini and return it as React Flow nodes + edges."""
    description = req.description.strip()
    if not description:
        raise HTTPException(status_code=400, detail="description must not be empty")

    try:
        result = parse_task(description)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    if not result.subtasks:
        raise HTTPException(status_code=422, detail="LLM produced no subtasks.")

    cycle_nodes = detect_cycle(result.subtasks)
    if cycle_nodes:
        raise HTTPException(
            status_code=422,
            detail=(
                "LLM produced a cyclic dependency graph. "
                f"Nodes involved in the cycle: {', '.join(cycle_nodes)}"
            ),
        )

    return to_react_flow(result.subtasks)
