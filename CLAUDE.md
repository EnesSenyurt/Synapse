# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite, http://localhost:5173)
npm run build        # Type-check + production build (tsc -b && vite build)
npm run lint         # ESLint
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode

# Run a single test file
npx vitest run src/utils/dagUtils.test.ts

# Run tests matching a name pattern
npx vitest run -t "döngü"
```

## Architecture

Synapse is a visual DAG automation editor. Users drag trigger/action nodes onto a React Flow canvas, connect them, and the app validates the resulting graph in real time.

### Data flow

```
nodeTemplates.ts  →  Sidebar (drag source)
                          ↓ drop
                      App.tsx (JSX + state wiring only)
                       ├── useFlowStorage     ← localStorage auto-save (1 s debounce)
                       ├── useToasts          ← toast state, addToast / removeToast
                       ├── useFlowHandlers    ← onConnect, onDrop, onDragOver,
                       │                         onNodeClick, onPaneClick,
                       │                         handleNodeUpdate, handleNodeDelete
                       ├── useToolbarActions  ← handleSave, handleValidate,
                       │                         handleClear, handleFitView, handleExport
                       ├── ReactFlow canvas
                       │     ├── TriggerNode / ActionNode (visual nodes)
                       │     └── edges (animated, purple)
                       ├── ConfigPanel     (right panel, appears on node select)
                       ├── Sidebar         (left panel, template search + drag)
                       ├── Toolbar         (top bar: save / validate / clear / export)
                       └── ToastContainer  (auto-dismiss notifications)
```

App.tsx contains only state declarations and JSX — all handler logic lives in `src/hooks/`.

### Node types

There are exactly two node types registered in `nodeTypes.ts`:
- `trigger` — orange accent, source handle only (bottom)
- `action` — purple accent, target (top) + source (bottom) handles

Node data shape (both types): `{ label, description, icon, config: Record<string,string>, configFields: ConfigField[] }`.

### Hook responsibilities

| Hook | Owns |
|------|------|
| `useFlowStorage` | localStorage read/write, debounce, `save()`, `clear()` |
| `useToasts` | toast array state; exports `AddToast` type used by other hooks |
| `useFlowHandlers` | all canvas interactions + node CRUD; receives `addToast`, `screenToFlowPosition`, state setters |
| `useToolbarActions` | toolbar button logic; receives `addToast`, `storageSave`, `storageClear`, `fitView` |

### DAG validation

`dagUtils.ts` exports four pure functions. `isValidConnection` is called on every attempted edge connection (real-time) and `validateDAG` / `topologicalSort` are called on the Validate button. Cycle detection uses DFS from the new edge's target back toward its source.

### Persistence

`useFlowStorage` hook manages all localStorage I/O. It skips the first render to avoid overwriting stored data on load, then debounces writes by 1 s on every subsequent change. `save()` flushes immediately (used by the Save button). Storage key: `synapse-flow-data`.

### Error boundary

`ErrorBoundary` (class component) wraps `<App>` in `main.tsx`. If any subtree throws, it renders a dark-themed fallback with a retry button that resets the boundary.

## Test layout

| File | What it covers |
|------|----------------|
| `src/utils/dagUtils.test.ts` | `wouldCreateCycle`, `isValidConnection`, `topologicalSort`, `validateDAG` — 20 tests |
| `src/hooks/useFlowStorage.test.ts` | `loadFromStorage` edge cases, auto-save debounce, `save()`, `clear()` — 11 tests |
| `src/data/nodeTemplates.test.ts` | Data integrity: types, required fields, select options, unique labels — 19 tests |

Tests run in jsdom via Vitest. Setup file: `src/test/setup.ts`.

## Key constraints

- **No backend** — all data is mock/template-based; localStorage is the only persistence.
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` are all on. Use `import type` for type-only imports.
- `Connection` from `@xyflow/react` requires `sourceHandle: null, targetHandle: null` — not just `source`/`target`.
- `vite.config.ts` imports `defineConfig` from `vitest/config` (not `vite`) so the `test` block is typed correctly.
