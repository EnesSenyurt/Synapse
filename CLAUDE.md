# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

```
Synapse/
├── apps/
│   ├── web/        @synapse/web   — React + Vite + React Flow (UI)
│   └── api/        @synapse/api   — Fastify + Prisma + SQLite (backend)
├── packages/
│   └── shared/     @synapse/shared — Node/Edge/Flow types + DAG utils
├── package.json    npm workspaces root
└── tsconfig.base.json
```

`@synapse/shared` is consumed by both `web` and `api` via npm workspaces (no build step — source is exported directly).

## Commands

Run from repository root. Use `--workspace @synapse/<name>` to target a single package.

```bash
# Install everything
npm install

# Web (default `npm run dev`)
npm run dev                              # Vite dev server, http://localhost:5173
npm run build --workspace @synapse/web   # tsc + vite build
npm run lint                             # ESLint across the repo

# API
npm run dev:api                          # tsx watch src/server.ts on :3001
npm run db:generate --workspace @synapse/api
npm run db:push --workspace @synapse/api
npm run db:migrate --workspace @synapse/api -- --name <migration_name>

# Tests
npm test                                 # all workspaces
npm test --workspace @synapse/web
npm test --workspace @synapse/api
npm test --workspace @synapse/shared
```

Single-test runs (from inside the relevant workspace):

```bash
npx vitest run src/routes/flows.test.ts
npx vitest run -t "döngü"
```

## Architecture

Synapse is a visual DAG automation editor and execution engine. Users drag trigger/action nodes onto a React Flow canvas, connect them, and the app validates the resulting graph in real time. Flows are persisted via the backend API; execution and real triggers are planned for Phase 2+.

### Frontend data flow (`apps/web`)

```
@synapse/shared (types, dagUtils) ──┐
                                    │
nodeTemplates.ts → Sidebar (drag source)
                       ↓ drop
                   App.tsx (JSX + state wiring only)
                    ├── useFlowApi          ← REST: fetch / create / save flow
                    ├── useToasts           ← toast state
                    ├── useFlowHandlers     ← canvas + node CRUD
                    ├── useToolbarActions   ← toolbar buttons (async save / clear)
                    ├── ReactFlow canvas
                    │     ├── TriggerNode / ActionNode
                    │     └── edges
                    ├── ConfigPanel
                    ├── Sidebar
                    ├── Toolbar
                    └── ToastContainer
```

`App.tsx` contains only state declarations and JSX — all handler logic lives in `apps/web/src/hooks/`.

### Backend (`apps/api`)

```
src/
├── server.ts            Process entry — builds app + listens
├── app.ts               buildApp({ prisma, webOrigin }) factory (used by tests)
├── db/client.ts         Prisma singleton
└── routes/
    └── flows.ts         Flow CRUD endpoints
```

The split between `server.ts` and `app.ts` is intentional: tests import `buildApp` and drive it with `app.inject()` (Fastify's in-process HTTP simulator) — no live socket, no supertest dep.

#### Endpoints (Phase 1)

| Method | Path          | Returns                             |
|--------|---------------|-------------------------------------|
| GET    | /health       | `{ status: 'ok' }`                  |
| GET    | /flows        | `FlowSummary[]` (sorted updatedAt↓) |
| GET    | /flows/:id    | `Flow` (parsed nodes + edges)       |
| POST   | /flows        | `Flow` (201)                        |
| PUT    | /flows/:id    | `Flow`                              |
| DELETE | /flows/:id    | 204                                 |

`nodes` and `edges` are stored as JSON strings in SQLite and parsed at the route boundary — the wire format always uses real `GraphNode[]` / `GraphEdge[]`.

### Shared package (`packages/shared`)

Exports:

- **Types**: `ConfigField`, `NodeTemplate`, `NodeData`, `GraphNode`, `GraphEdge`, `GraphConnection`, `FlowData`, `FlowSummary`, `Flow`
- **DAG utils**: `wouldCreateCycle`, `isValidConnection`, `topologicalSort`, `validateDAG`

The shared types intentionally avoid depending on `@xyflow/react` so the backend can consume them. The web app's `Node` / `Edge` from `@xyflow/react` are structurally compatible — `apps/web` casts at the boundary.

### Node types

Two node types registered in `nodeTypes.ts`:
- `trigger` — orange accent, source handle only (bottom)
- `action` — purple accent, target (top) + source (bottom) handles

Node data shape (both types): `{ label, description, icon, config: Record<string,string>, configFields: ConfigField[] }`.

### Node templates

`apps/web/src/data/nodeTemplates.ts` defines all draggable templates. Currently **11 triggers** and **14 actions**. When adding a new template, every `configFields[].key` must exist as a key in `defaultConfig` — the `nodeTemplates.test.ts` data-integrity tests enforce this.

### Hook responsibilities (`apps/web/src/hooks/`)

| Hook | Owns |
|------|------|
| `useFlowApi` | API fetch/create/save/clear; tracks current flow id in localStorage |
| `useToasts` | toast array state; exports `AddToast` type used by other hooks |
| `useFlowHandlers` | all canvas interactions + node CRUD |
| `useToolbarActions` | toolbar button logic; calls async `storageSave` / `storageClear` |

### DAG validation

`packages/shared/src/dag.ts` exports four pure functions. `isValidConnection` is called on every attempted edge connection (real-time) and `validateDAG` / `topologicalSort` are called on the Validate button. Cycle detection uses DFS from the new edge's target back toward its source.

### Persistence

The backend owns persistence. `useFlowApi`:
1. On mount, reads `synapse-current-flow-id` from localStorage. If found, `GET /flows/:id`. If missing or 404, `POST /flows` and stores the new id.
2. Exposes `save(nodes, edges)` → `PUT /flows/:id` and `clear()` → `PUT /flows/:id` with empty arrays.

Auto-save is **not** wired yet — the user must click Save. This is intentional for Phase 1; auto-save returns in a later phase together with execution status streaming.

Local SQLite DB lives at `apps/api/prisma/dev.db` (gitignored). Test DB is `apps/api/prisma/test.db`, recreated by `apps/api/test/globalSetup.ts` before each Vitest run.

### Error boundary

`ErrorBoundary` (class component) wraps `<App>` in `main.tsx`. If any subtree throws, it renders a dark-themed fallback with a retry button that resets the boundary.

## Test layout

| File | What it covers |
|------|----------------|
| `packages/shared/src/dag.test.ts` | `wouldCreateCycle`, `isValidConnection`, `topologicalSort`, `validateDAG` — 25 tests |
| `apps/web/src/data/nodeTemplates.test.ts` | Data integrity: types, required fields, select options, unique labels — 13 tests |
| `apps/api/src/routes/flows.test.ts` | 5 endpoints, happy + 404 paths, health — 11 tests |

Web tests run in jsdom; api/shared tests run in node. All via Vitest. Setup file for web: `apps/web/src/test/setup.ts`.

## Roadmap (where this is going)

- **Phase 1 (done)**: Persistence API, monorepo, shared types.
- **Phase 2**: Execution engine — topological run, node handler registry, `Run` button, `Run` / `NodeRun` tables.
- **Phase 3**: Trigger infrastructure — `/webhooks/:flowId/:nodeId`, cron scheduler, polling triggers, run history UI.
- **Phase 4**: Auth + encrypted secrets vault.

## Key constraints

- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` are all on. Use `import type` for type-only imports.
- **Shared package must not import browser libs** (no `@xyflow/react`, no React) — keep it node-friendly so the backend can use it.
- `Connection` from `@xyflow/react` requires `sourceHandle: null, targetHandle: null` — not just `source`/`target`.
- `apps/web/vite.config.ts` imports `defineConfig` from `vitest/config` (not `vite`) so the `test` block is typed correctly.
- Prisma destructive ops (`prisma db push --force-reset`, `prisma migrate reset`) are gated by Prisma's Claude Code guard. Never use `--force-reset`; the test global setup deletes `test.db` via Node's `rmSync` instead.
- API tests use `app.inject()` (Fastify in-process simulator) — do not introduce `supertest`.
