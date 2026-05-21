# PBI Bookmark Visualiser

A browser-based tool for auditing and visualising Power BI bookmarks in PBIR report format.

## What it does

- **Parse PBIR bookmarks** — upload a `.Report` folder or PBIP project folder and the tool extracts all bookmarks entirely in the browser (no server, no uploads)
- **Classify bookmark types** — identifies toggle pairs, sets, data-only bookmarks, and more
- **Wireframe canvas** — renders a schematic of affected visuals for each selected bookmark
- **Search and filter** — find bookmarks by name, type, or affected visual in real time
- **Demo mode** — explore a pre-loaded sample report without uploading anything

## Getting started

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
cd app
npm run build
```

### Run tests

```bash
cd app
npm test -- --pool=vmForks --run
```

## Telemetry

This tool uses [Plausible Analytics](https://plausible.io/open-source-website-analytics) for basic, privacy-respecting usage metrics.

**What is collected:**

- Anonymised page view counts
- File upload counts

**What is NOT collected:**

- Report content or bookmark data
- File names or file metadata
- File size
- User identifiers, IP addresses, or cookies

Plausible is cookieless and GDPR-compliant by design. The full source of the analytics integration is open and auditable in this repository (`app/src/shared/utils/telemetry.ts`). The Plausible open-source project can be reviewed at [plausible.io/open-source-website-analytics](https://plausible.io/open-source-website-analytics).

Telemetry is disabled automatically when the `VITE_PLAUSIBLE_DOMAIN` environment variable is absent (e.g. during local development).

## Built with AI

This project was built using [Claude Code](https://claude.ai/code) and the [BMAD Method](https://bmad.dev), an AI-assisted software development workflow. The BMAD Method structures LLM-assisted development through documented planning artifacts, sprint tracking, and agent-driven implementation — enabling a single developer to produce a fully tested, production-ready application.

## Licence

See [LICENSE](LICENSE).
