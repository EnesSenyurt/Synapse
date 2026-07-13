"""DAG helpers: cycle detection and React Flow mapping with depth-based layout."""

from collections import defaultdict, deque

from models import Subtask

X_SPACING = 240
Y_SPACING = 130


def detect_cycle(subtasks: list[Subtask]) -> list[str]:
    """Return ids of subtasks stuck in a cycle, or [] if the graph is a DAG.

    Uses Kahn's algorithm: after topological processing, any node whose indegree
    never reached zero is part of (or downstream of) a cycle.
    """
    ids = {s.id for s in subtasks}
    indegree: dict[str, int] = {s.id: 0 for s in subtasks}
    adj: dict[str, list[str]] = defaultdict(list)

    for s in subtasks:
        for dep in s.depends_on:
            if dep not in ids:
                # Unknown dependency — treat as external and ignore for cycle purposes.
                continue
            adj[dep].append(s.id)
            indegree[s.id] += 1

    queue: deque[str] = deque(node for node, d in indegree.items() if d == 0)
    processed = 0
    while queue:
        node = queue.popleft()
        processed += 1
        for nxt in adj[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    if processed == len(subtasks):
        return []
    return [node for node, d in indegree.items() if d > 0]


def _compute_depths(subtasks: list[Subtask]) -> dict[str, int]:
    """Longest-path depth from a root for each subtask id. Assumes DAG."""
    by_id = {s.id: s for s in subtasks}
    ids = set(by_id)
    depth: dict[str, int] = {}

    def resolve(node_id: str, stack: set[str]) -> int:
        if node_id in depth:
            return depth[node_id]
        if node_id in stack:
            # Defensive: cycle detection should have caught this already.
            return 0
        stack.add(node_id)
        deps = [d for d in by_id[node_id].depends_on if d in ids]
        result = 0 if not deps else 1 + max(resolve(d, stack) for d in deps)
        stack.discard(node_id)
        depth[node_id] = result
        return result

    for s in subtasks:
        resolve(s.id, set())
    return depth


def to_react_flow(subtasks: list[Subtask]) -> dict:
    """Convert subtasks into a React Flow-shaped dict with a depth-based layout.

    Y axis reflects dependency depth (roots at top); X axis spreads siblings horizontally.
    """
    depths = _compute_depths(subtasks)

    by_depth: dict[int, list[str]] = defaultdict(list)
    for sid, d in depths.items():
        by_depth[d].append(sid)

    positions: dict[str, dict[str, float]] = {}
    for d, sids in by_depth.items():
        for i, sid in enumerate(sids):
            positions[sid] = {"x": i * X_SPACING, "y": d * Y_SPACING}

    nodes = [
        {
            "id": s.id,
            "data": {"label": s.title},
            "position": positions[s.id],
        }
        for s in subtasks
    ]

    ids = {s.id for s in subtasks}
    edges = [
        {"id": f"{dep}->{s.id}", "source": dep, "target": s.id}
        for s in subtasks
        for dep in s.depends_on
        if dep in ids
    ]

    return {"nodes": nodes, "edges": edges}
