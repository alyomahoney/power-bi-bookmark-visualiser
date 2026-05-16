# Contributing

## Setup

```bash
git clone <repo-url>
cd pbi-bookmark-app/app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Running tests

```bash
cd app
npm test                        # watch mode
npm run test:coverage           # coverage report (thresholds: 80% statements, 75% branches)
```

## Before opening a PR

```bash
npm run lint    # must pass
npm run build   # must pass (tsc + vite build — TypeScript errors block the build)
npm test -- --run   # full test suite must pass with no regressions
```

## Code conventions

The full set of implementation rules lives in `_bmad-output/project-context.md`. Key points:

- **No enums** — `erasableSyntaxOnly: true` in tsconfig; use string literal unions
- **No `tailwind.config.js`** — Tailwind v4 uses `@theme {}` in `src/index.css`
- **Store access via hooks** — use selector hooks from `src/store/hooks.ts`, never `useXxxStore()` directly in components
- **Co-located tests** — test files sit next to source files, no `__tests__/` directories
- **No hardcoded user-facing strings** — all copy lives in `src/constants/errorMessages.ts`
- **No outbound network calls** except `plausible.io` — CSP enforced in `vercel.json`

## Project structure

The repo root contains BMAD planning artifacts (`_bmad/`, `_bmad-output/`). All application source code lives in `app/`. Never mix the two.

## V2 scope (not accepting PRs yet)

The following are planned for V2 and not in scope for contributions right now:

- Health scorecard (orphaned, useless, duplicate bookmark detection)
- Persona archetypes
- Export formats (PDF, markdown, docx)
- Multiple demo sample reports

## Licence

MIT — see [LICENSE](LICENSE).
