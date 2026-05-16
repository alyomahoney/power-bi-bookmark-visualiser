# Power BI Bookmark Visualiser — App

This is the Vite application subfolder. All development commands run from here.

## Dev commands

```bash
npm run dev          # start dev server at localhost:5173
npm run build        # type-check + production build to dist/
npm run preview      # preview production build locally
npm test             # run tests in watch mode
npm run test:coverage  # run tests with coverage report
npm run lint         # ESLint
```

## Project structure

```
src/
  features/          # feature modules (upload, wireframe, audit, demo)
  shared/            # reusable components, hooks, utils
  store/             # Zustand stores + selector hooks
  workers/           # Web Worker + parsing sub-modules
  types/             # shared TypeScript types
  constants/         # app-wide constants and error messages
  components/ui/     # shadcn/ui generated components
```

## Key conventions

- All dev commands run from `app/` — not the repo root
- Tailwind v4: design tokens in `src/index.css` (`@theme {}`) — no `tailwind.config.js`
- TypeScript strict mode + `erasableSyntaxOnly: true` — enums are forbidden, use string literal unions
- Store access via selector hooks in `src/store/hooks.ts` — never call `useXxxStore()` directly in components
- Test files co-located with source — no `__tests__/` directories
- Coverage thresholds: statements 80%, branches 75%

See `../_bmad-output/project-context.md` for the full AI agent rules and implementation conventions.
