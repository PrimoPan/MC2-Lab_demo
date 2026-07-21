# Frontend migration architecture

## Outcome

The application now uses Node.js 24 LTS, TypeScript 7, Vite 8, React route-level code splitting, and Tailwind CSS 4. The migration keeps the pre-migration rendering as a locked contract: seven route families, two languages, and two viewport sizes compare with zero changed pixels.

## Component boundaries

- Route files in `src/pages/` compose page shells and data; they do not own large content collections.
- Archived publications live as typed JSON by year and render through `ArchivedPublicationSections`.
- The workshop route chooses a language article component and shares image behavior and speaker-card hooks.
- People content is separated into member cards, exploration/filtering, and alumni sections.
- All routes are loaded with `React.lazy`, keeping the shared entry chunk small and allowing page code to change independently.

## Styling model

`src/styles/tailwind.css` is the single style entry point. Its explicit cascade order is:

1. Tailwind theme
2. external vendor fonts
3. global base
4. Tailwind components and utilities
5. Bootstrap compatibility
6. icon fonts

React components use Tailwind utilities, including the important modifier where a historical vendor selector must be overridden. Complex components keep reusable utility strings in colocated `*Styles.ts` modules so their state variants remain readable without reintroducing selector-based stylesheets.

`src/styles/tailwind.css` is the only CSS file. It owns the global reset, the route-entry and People-search keyframes, Tailwind imports, and the external vendor/icon imports required by the historical markup.

## Upgrade rules

1. Run `nvm use` before installing or building.
2. Keep TypeScript and Vite on exact versions in `package.json`; upgrade intentionally and regenerate `package-lock.json` with `npm install`.
3. Run `npm run typecheck` and `npm run build`.
4. Capture all 28 visual cases at the documented viewports, freeze dynamic media to matching frames, and require a zero-pixel deterministic comparison.
5. Push `main` only after the checked build passes; Vite keeps the existing `build/` artifact contract and the production update is owned by GitHub Actions.

## Adding content

- Add shared behavior to `src/components/` or `src/hooks/`, not directly to a route file.
- Add structured content to `src/data/` instead of duplicating long JSX blocks.
- Use Tailwind utilities for new component styling.
- Keep English and Chinese content structurally synchronized.
- Preserve public route aliases when an external URL has already existed.
