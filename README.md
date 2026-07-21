# MC2 Lab Website

React + TypeScript website for the Center for Metaverse and Computational Creativity (MC2), HKUST and HKUST(GZ).

Author: **Dongyijie Primo Pan**

## Runtime and toolchain

- Node.js 24.18.0 LTS for local development (pinned in `.nvmrc`); Node.js 20.19+ is the supported CI minimum
- TypeScript 7.0.2
- Vite 8.1.5
- React 18.3.1
- Tailwind CSS 4.3.3

```bash
nvm install
nvm use
npm ci
npm run dev
```

Quality and production commands:

```bash
npm run typecheck
npm run build
npm run preview
```

Vite writes the production site to `build/` to preserve the established GitHub Actions packaging contract. `npm run build` always runs the TypeScript check first.

## Project structure

- `src/router/routes.tsx`: lazy route modules, canonical URLs, and compatibility redirects.
- `src/pages/`: thin route-level React composition.
- `src/components/`: shared and page-specific React components.
- `src/data/`: typed content and generated JSON data.
- `src/data/publications/`: archived publication records grouped by year.
- `src/hooks/`: reusable interaction and browser hooks.
- `src/styles/tailwind.css`: the only global style entry point and cascade-layer order.
- page-level `*Styles.ts` modules: reusable Tailwind utility strings for complex components.
- `public/images/`: static images referenced with `/images/...`.
- `content/submissions/`: publication source data.
- `tools/`: publication update and synchronization scripts.

All application presentation uses Tailwind utilities. The only CSS file is `src/styles/tailwind.css`, which contains the global reset, shared keyframes, Tailwind imports, and external vendor/icon imports.

## Content workflows

Refresh publication data and build:

```bash
npm run update:all
```

Sync recent publications from Pan Hui's website:

```bash
npm run pub:sync
npm run pub:sync -- --dry-run
```

Edit recent publication entries in `src/data/recentPublications.json`. The typed bridge in `src/data/recentPublications.ts` should not contain hand-edited content.

## Routes

English routes are `/`, `/people`, `/publication`, `/project`, `/news`, `/news/:slug`, and `/leader`. Chinese routes use the same structure under `/zh`. Historical `.html` URLs remain redirects for external compatibility.

## Visual fidelity contract

UI maintenance must preserve the current screenshots exactly.

- Validate Home, Leader, Publication, Workshop, People, News, and Project in English and Chinese (14 routes).
- Test desktop at 1440 x 1000 and mobile at 390 x 844.
- Compare the 28 settled-state screenshots before and after the change.
- Freeze animated media and CSS animations to the same frame, and verify the underlying asset hashes separately.
- A visual migration is accepted only when all 28 deterministic comparisons report zero changed pixels.
- Keep Tailwind layer order in `src/styles/tailwind.css`; changing it can alter Bootstrap or icon-font selector precedence.

The TypeScript 7, Vite 8, component, and Tailwind migration is described in `docs/frontend-migration.md`.

## Deployment

Pushing `main` runs `.github/workflows/deploy-pages.yml`. GitHub Actions performs a clean install and checked Vite build, packages `build/`, uploads it over SSH, and invokes the existing atomic deployment script on the production server. Local development uses the Node 24 version pinned in `.nvmrc`; the existing Action runner remains on its repository-configured Node version until the GitHub credential has workflow-edit permission.
