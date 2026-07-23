# MC2 Lab Website

React + TypeScript website for the Center for Metaverse and Computational Creativity (MC2), HKUST and HKUST(GZ).

Author: **Dongyijie Primo Pan**

## Documentation index

- [Quick start](#quick-start)
- [Architecture and source tree](#architecture-at-a-glance)
- [Route-to-module map](#route-to-module-map)
- [Page and component inventory](#page-modules)
- [Hooks, data, localization, and types](#hooks)
- [Styling system](#styling-system)
- [Common maintenance map](#common-maintenance-map)
- [Publication workflows](#publication-workflows)
- [Adding or refactoring code](#adding-or-refactoring-code)
- [Visual fidelity and deployment](#visual-fidelity-contract)

## Quick start

The local Node.js version is pinned in `.nvmrc`.

```bash
nvm install
nvm use
npm ci
npm run dev
```

Before submitting a change:

```bash
npm run typecheck
npm run build
npm run preview
```

`npm run build` always runs the TypeScript check first. Vite writes the production site to `build/` because the GitHub Actions deployment workflow packages that directory.

## Runtime and toolchain

| Tool | Version / contract |
| --- | --- |
| Node.js | 24.18.0 LTS locally; `>=20.19.0 <25` is accepted by `package.json` |
| npm | `>=10.8.2` |
| React | 18.3.1 |
| React Router | 6.30.1 |
| TypeScript | 7.0.2, strict, no emit |
| Vite | 8.1.5 |
| Tailwind CSS | 4.3.3 through `@tailwindcss/vite` |
| Build output | `build/` |

There is no `tailwind.config.*` file. This project uses Tailwind 4's CSS-first setup and the Vite plugin.

## Architecture at a glance

```text
src/index.tsx
  -> BrowserRouter
  -> App.tsx
  -> router/routes.tsx
  -> route-level page in src/pages/
  -> shared shell/navigation + feature components
  -> typed data, hooks, and colocated Tailwind style modules
```

Route modules are loaded with `React.lazy`. A page should mainly choose locale, obtain data, and compose components. Reusable behavior belongs in `src/components/` or `src/hooks/`; structured content belongs in `src/data/`.

## Source tree

```text
src/
├── index.tsx                  Application entry and global CSS import
├── App.tsx                    Suspense boundary and route rendering
├── router/routes.tsx          Lazy routes, canonical URLs, compatibility redirects
├── pages/                     Route-level composition
├── components/
│   ├── contact/               Shared contact menu
│   ├── home/                  Home hero, panels, and social controls
│   ├── news/                  News list, article renderer, and styles
│   ├── people/                Member explorer, cards, alumni, and styles
│   ├── project/               Project cards and styles
│   ├── publication/           Archived publication rendering and styles
│   └── workshop/              Bilingual workshop article and style registry
├── data/                      Checked-in runtime content and typed bridges
├── hooks/                     Reusable browser and interaction behavior
├── i18n/                     Navigation labels and locale-aware route helpers
├── styles/tailwind.css        The only global CSS file
└── types/                     Shared TypeScript models
```

Outside `src/`:

| Path | Responsibility |
| --- | --- |
| `public/images/` | Static site images addressed as `/images/...` |
| `content/submissions/publications/` | Markdown publication-submission input and its images |
| `tools/` | Publication generation and synchronization scripts |
| `docs/frontend-migration.md` | TypeScript/Vite/Tailwind migration decisions |
| `.github/workflows/deploy-pages.yml` | Checked build and production deployment |
| `vite.config.ts` | React and Tailwind plugins; `build/` output contract |
| `tsconfig.json` | Strict TypeScript/Bundler settings for `src`, `tools`, and Vite |

## Route-to-module map

Every English route has a Chinese equivalent under `/zh`.

| English / Chinese route | Page module | Main renderer | Content source | Main style source |
| --- | --- | --- | --- | --- |
| `/`, `/zh` | `pages/HomePage.tsx` | `HomeHero`, `HomePanels`, `HomeSocialMenu` | `data/homePageContent.ts` | Tailwind strings inside the Home page/components |
| `/people`, `/zh/people` | `pages/PeoplePage.tsx` | `people/PeopleContent.tsx` | `peopleContent.generated.json` through `legacyPageContent.ts` | `people/peopleStyles.ts` |
| `/publication`, `/zh/publication` | `pages/PublicationPage.tsx` | Recent items in the page plus `ArchivedPublicationSections` | `recentPublications.json`, `publications/20xx.json`, People data for author links | `publication/publicationStyles.ts` |
| `/project`, `/zh/project` | `pages/ProjectPage.tsx` | `project/ProjectContent.tsx` | `projectContent.generated.json` through `legacyPageContent.ts` | `project/projectStyles.ts` |
| `/news`, `/zh/news` | `pages/NewsPage.tsx` | `news/NewsListContent.tsx` | `newsContent.generated.json` through `legacyPageContent.ts` | `news/newsStyles.ts` |
| `/news/japantimes-ai-love`, Chinese equivalent | `pages/NewsJapanTimesAILovePage.tsx` | `NewsArticleContent` | `newsContent.generated.json` | `news/newsStyles.ts` |
| `/news/nature-spotlight`, Chinese equivalent | `pages/NewsNatureSpotlightPage.tsx` | `NewsArticleContent` | `newsContent.generated.json` | `news/newsStyles.ts` |
| `/news/ai-as-catalyst-workshop`, Chinese equivalent | `pages/NewsAIAsCatalystWorkshopPage.tsx` | Locale-specific Workshop article | Bilingual article JSX | `workshop/workshopStyles.ts` |
| `/leader`, `/zh/leader` | `pages/LeaderPage.tsx` | Page-local profile sections | Localized `leaderContent` in the page | Tailwind strings inside the page |

Historical `.html` and `/legacy/...` URLs are redirected in `router/routes.tsx`. Preserve an alias once it has been published externally.

## Page modules

| Module | Responsibility |
| --- | --- |
| `pages/HomePage.tsx` | Owns Home panel/social-menu state and composes the full-screen Home experience. It uses `SiteNav` directly because its panel transitions do not use the standard page shell. |
| `pages/LeaderPage.tsx` | Owns the bilingual Director profile, document/body presentation, biography, research agenda, and project highlights. Content and page-specific styles currently live together here. |
| `pages/PeoplePage.tsx` | Selects localized People data and connects it to `SitePageShell` and `PeopleContent`. |
| `pages/PublicationPage.tsx` | Owns year navigation, recent publication rendering, author-to-member link resolution, and composition of archived years. |
| `pages/ProjectPage.tsx` | Selects localized Project data and connects it to `ProjectContent`. |
| `pages/NewsPage.tsx` | Selects the localized News list and connects it to `NewsListContent`. |
| `pages/NewsJapanTimesAILovePage.tsx` | Selects the Japan Times article and renders it with the shared article renderer. |
| `pages/NewsNatureSpotlightPage.tsx` | Selects the Nature article and renders it with the shared article renderer. |
| `pages/NewsAIAsCatalystWorkshopPage.tsx` | Selects the English or Chinese Workshop article, attaches speaker-card behavior, and supplies the language-alternate URL. |

## Shared components

| Component | Responsibility |
| --- | --- |
| `components/SitePageShell.tsx` | Standard `<main>` wrapper. It renders `SiteNav`, forwards a page ref, and keeps route/locale/navigation props consistent. |
| `components/SiteNav.tsx` | Brand logos, desktop navigation, mobile menu, active-route state, language switching, outside-click closing, and route-entry animation. Route-specific compatibility variants are intentionally centralized here. |
| `components/FloatingContactMenu.tsx` | Stateful wrapper for the bottom-right contact control. It owns open/close behavior and outside click/touch handling. |
| `components/contact/ContactMenu.tsx` | Presentational contact menu used by Home and inner pages. It owns link definitions, icon classes, animation delays, and accessible labels. |

`FloatingContactMenu` manages state; `ContactMenu` renders the control. Reuse this pair rather than creating another floating social/contact implementation.

## Home components

| Component / module | Responsibility |
| --- | --- |
| `home/HomeHero.tsx` | Full-screen background, MC2 heading, News/film/open-call actions, and keyboard-accessible About/Contact launch controls. |
| `home/HomePanels.tsx` | Chooses and renders the About and Contact panels from one `activePanel` value. |
| `home/HomeAboutPanel.tsx` | About copy, research-focus list, leader link, transition state, and close control. |
| `home/HomeContactPanel.tsx` | Email/social links, transition state, and close control. |
| `home/HomePanelCloseButton.tsx` | Shared keyboard-accessible close control with About/Contact variants. |
| `home/HomeSocialMenu.tsx` | Positions and configures `ContactMenu` for the Home page. |
| `home/homeKeyboard.ts` | Shared Enter/Space activation helper for non-native interactive legacy elements. |

Home page copy belongs in `data/homePageContent.ts`. Layout and interaction styling belongs in the corresponding Home component.

## News components

| Component / module | Responsibility |
| --- | --- |
| `news/NewsListContent.tsx` | Year navigation, scroll spy, query-triggered SURREALITY modal, News cards, and the floating contact menu. Internal components are `NewsCard` and `SurrealityModal`. |
| `news/NewsArticleContent.tsx` | Shared renderer for typed article blocks, cover media, source links, and return-to-News navigation. Internal `ArticleBlock` handles paragraph, heading, and list variants. |
| `news/InlineMc2Text.tsx` | Converts inline `MC2` text to the visual `MC²` form without putting HTML into content data. |
| `news/newsStyles.ts` | All News list, card, modal, article, year-navigation, and responsive Tailwind class strings. |

The Workshop is a specialized News route but has its own components and style registry because its article structure is much larger than the standard typed article model.

## People components

| Component / module | Responsibility |
| --- | --- |
| `people/PeopleContent.tsx` | People-page scrolling, Current/Alumni navigation, mobile sub-navigation behavior, anchor highlighting, filtering, and floating contact control. |
| `MemberExplorer` inside `PeopleContent.tsx` | Search, role filters, sorting, empty state, and visible-member selection. |
| `MemberCard` inside `PeopleContent.tsx` | Front/back card state, photo fallback, research details, profile link, and accessible expand/collapse control. |
| `AlumniSections` inside `PeopleContent.tsx` | Renders grouped alumni data. |
| `people/peopleStyles.ts` | People shell, search, filter chips, section navigation, cards, transitions, alumni, and responsive Tailwind strings/state helpers. |

Member content belongs in `data/peopleContent.generated.json`; search/card behavior belongs in `PeopleContent.tsx`; appearance belongs in `peopleStyles.ts`.

## Project components

| Component / module | Responsibility |
| --- | --- |
| `project/ProjectContent.tsx` | Project section composition and floating contact control. |
| `ProjectCard` inside `ProjectContent.tsx` | Project image, title, people, descriptions, tags, optional link, and fallback media. |
| `project/projectStyles.ts` | Project shell, grid/column compatibility, cards, text, tags, and responsive Tailwind strings. |

Project content belongs in `data/projectContent.generated.json`.

## Publication components

| Component / module | Responsibility |
| --- | --- |
| `pages/PublicationPage.tsx` | Recent years, active-year navigation, author parsing, member-link lookup, scroll behavior, and full page composition. |
| `AuthorList` inside `PublicationPage.tsx` | Converts matching MC2 member names into localized People/Director links while preserving separators. |
| `YearNav` inside `PublicationPage.tsx` | Fixed/compact publication-year navigation. |
| `RecentPublicationItem` and `RecentPublicationSections` | Render 2025+ typed publication entries grouped by year. |
| `publication/ArchivedPublicationSections.tsx` | Renders archived 2021–2024 records, optional DOI/PDF/video controls, nested-row compatibility, and fallback media. |
| `publication/publicationStyles.ts` | Publication shell, year navigation, recent cards, archived cards, author links, buttons, and floating contact position. |

Recent publication content is separate from archived publication content:

- `data/recentPublications.json`: current years rendered as compact text cards.
- `data/publications/2021.json` through `2024.json`: archived visual publication cards.
- `data/publications/archivedPublications.ts`: typed year aggregator for the archived JSON files.

## Workshop components

| Component / module | Responsibility |
| --- | --- |
| `workshop/EnglishWorkshopArticle.tsx` | Complete English Workshop article markup. |
| `workshop/ChineseWorkshopArticle.tsx` | Complete Chinese Workshop article markup with the same structural sections. |
| `workshop/workshopStyles.ts` | Central registry mapping Workshop semantic class tokens to Tailwind utility strings. |
| `workshop/workshopImageHandlers.ts` | Organizer/affiliation image hiding and speaker-photo fallback behavior. |
| `hooks/useWorkshopSpeakerCards.ts` | Open/close state, keyboard activation, hash deep links, scroll positioning, and responsive detail heights for speaker cards. |

All Workshop `className` values should pass through `workshopClass(...)`. It preserves the semantic token, adds an optional `ws-` alias for underscore names, and appends the Tailwind utilities from `WORKSHOP_STYLES`. Update English and Chinese article structure together.

## Hooks

| Hook | Responsibility |
| --- | --- |
| `hooks/useDocumentTitle.ts` | Sets the browser document title and updates it when the value changes. |
| `hooks/useCloseOnOutsideInteraction.ts` | Closes a referenced UI surface on outside click or touch while enabled. |
| `hooks/useSectionScrollSpy.ts` | Resolves the active section inside an element scroll container, including bottom-of-page handling. Used by News and People. |
| `hooks/useWorkshopSpeakerCards.ts` | Adds accessible speaker-card interaction to the large Workshop article markup. |
| `hooks/useBodyClass.ts` | Reusable add/remove body-class utility. It is currently available but not imported by a route. |

## Data, localization, and type modules

| Module | Responsibility / editing rule |
| --- | --- |
| `data/homePageContent.ts` | Hand-edited Home labels, About copy, research focuses, and contact links. |
| `data/legacyPageContent.ts` | Typed bridge that exposes the generated People, Project, and News JSON to React. Do not duplicate this casting in pages. |
| `data/peopleContent.generated.json` | Checked-in bilingual People/alumni runtime data. Keep both locales structurally synchronized. |
| `data/projectContent.generated.json` | Checked-in bilingual Project runtime data. |
| `data/newsContent.generated.json` | Checked-in bilingual News list and standard article runtime data. |
| `data/recentPublications.json` | Hand-editable recent publication data; also updated by the publication sync tool. |
| `data/recentPublications.ts` | Type-safe bridge for `recentPublications.json`; it should not contain hand-edited entries. |
| `data/publications/2021.json`–`2024.json` | Archived publication card data grouped by year. |
| `data/publications/archivedPublications.ts` | Imports and orders the archived year files. |
| `data/publications.generated.json` | Output of `tools/update-publications.ts`. It is currently not imported by the visible Publication route. |
| `i18n/site.ts` | Canonical route paths, navigation order/labels, language-control text, and alternate-locale helpers. |
| `types/common.ts` | Locale, route, publication-submission, generated-publication, and leader-profile models. |
| `types/home.ts` | Home panel and Home content models. |
| `types/legacyPages.ts` | People, Project, News, article, and localization data models. |
| `types/publications.ts` | Archived publication/year models. |
| `vite-env.d.ts` | Vite client type declarations. |

The `*.generated.json` People/Project/News files are runtime inputs despite their names. No npm script in this repository currently regenerates those three files, so treat changes as deliberate checked-in content updates and validate their shape against `types/legacyPages.ts`.

## Styling system

### Global CSS

`src/styles/tailwind.css` is the only tracked CSS/SCSS/Less/Stylus file. It owns:

- the explicit cascade-layer order;
- external Bootstrap compatibility styles;
- external Font Awesome, Boxicons, and Material Symbols;
- external Poppins, Open Sans, Noto Sans, Permanent Marker, and Dancing Script fonts;
- Tailwind theme and utilities;
- the exclusion that prevents this README from becoming a Tailwind class-candidate source;
- the `html`, `body`, and `#root` sizing/reset contract;
- route-entry keyframes for the shared navigation and Leader route.

The declared layer order is:

```css
@layer theme, vendor, base, components, utilities, bootstrap, icons;
```

Do not reorder these layers casually. Bootstrap and icon fonts intentionally remain available for historical semantic classes and icons.

### Where component styles live

| Feature | Style ownership |
| --- | --- |
| Shared navigation | Constants inside `components/SiteNav.tsx` |
| Shared contact menu | Tailwind strings inside `components/contact/ContactMenu.tsx` |
| Home | Tailwind strings inside each Home component and `HomePage.tsx` |
| Leader | Tailwind strings inside `LeaderPage.tsx` |
| News | `components/news/newsStyles.ts` |
| People | `components/people/peopleStyles.ts` |
| Project | `components/project/projectStyles.ts` |
| Publication | `components/publication/publicationStyles.ts` |
| Workshop | Semantic-token registry in `components/workshop/workshopStyles.ts` |

### Style rules

1. Use Tailwind utilities for all application presentation. Do not add a page-specific CSS file.
2. Keep a short, one-off utility string next to its markup. Move repeated or stateful class strings into the feature's `*Styles.ts` module.
3. Use exported state helpers such as `peopleCardToggleClass(isVisible)` when appearance depends on component state.
4. The trailing Tailwind important modifier (`...!`) is intentional. It protects the migrated design from later Bootstrap/icon-layer declarations and legacy semantic class specificity.
5. Keep historical semantic classes such as `row`, `container`, `card`, or `news-section` when JavaScript behavior or compatibility depends on them; Tailwind still owns their final presentation.
6. Prefer the existing responsive thresholds before introducing a new breakpoint: 1080/980px for navigation and large layouts, 840px for tablet News/Home behavior, and 640/480px for compact/mobile states.
7. Preserve `motion-reduce` fallbacks when adding transitions or animations.
8. Do not add inline style mutations for ordinary presentation. The existing Workshop image/error handlers are compatibility exceptions.

## Common maintenance map

| Change | Start here |
| --- | --- |
| Change a navigation label/order/path | `src/i18n/site.ts`, then `src/router/routes.tsx` if the URL changes |
| Change navigation appearance/mobile behavior | `src/components/SiteNav.tsx` |
| Change shared contact links | `src/components/contact/ContactMenu.tsx` |
| Change Home copy | `src/data/homePageContent.ts` |
| Change Home layout or panels | Matching file under `src/components/home/` |
| Change Director content or layout | `src/pages/LeaderPage.tsx` |
| Add/edit a member or alumni record | `src/data/peopleContent.generated.json` |
| Change People search, sorting, or card behavior | `src/components/people/PeopleContent.tsx` |
| Change People appearance | `src/components/people/peopleStyles.ts` |
| Add/edit a project | `src/data/projectContent.generated.json` |
| Change project rendering/appearance | `src/components/project/ProjectContent.tsx` and `projectStyles.ts` |
| Add/edit a standard News item/article | `src/data/newsContent.generated.json` |
| Change standard News rendering | `src/components/news/NewsListContent.tsx` or `NewsArticleContent.tsx` |
| Change News appearance | `src/components/news/newsStyles.ts` |
| Change the Workshop article | Both Workshop article components and `workshopStyles.ts` |
| Edit 2025+ publications | `src/data/recentPublications.json` or run `npm run pub:sync` |
| Edit archived 2021–2024 publications | Matching JSON under `src/data/publications/` |
| Change publication author links | `src/pages/PublicationPage.tsx` |
| Add a new canonical route | `src/router/routes.tsx`, a page module, `src/i18n/site.ts`, and required compatibility redirects |
| Change global fonts/vendor imports/reset/keyframes | `src/styles/tailwind.css` |

## Publication workflows

Refresh Markdown submission data and build:

```bash
npm run update:all
```

`tools/update-publications.ts` validates front matter, HTTP(S) URLs, image existence, and duplicate links before writing `src/data/publications.generated.json`. The current visible Publication route does not consume that output yet.

Sync recent publications from Pan Hui's website:

```bash
npm run pub:sync
npm run pub:sync -- --dry-run
npm run pub:sync:check
```

`tools/sync-recent-publications.ts` parses selected years, normalizes titles/authors/venues, applies the exact-name exclusion policy defined in the script, and writes `src/data/recentPublications.json`. Use `--dry-run` or `pub:sync:check` before accepting remote changes.

## Adding or refactoring code

1. Add a canonical route in `router/routes.tsx`; add the Chinese route and any historical redirect at the same time.
2. Keep the page module thin: locale, document title, data selection, shell, and feature composition.
3. Put reusable UI under the relevant `components/<feature>/` directory.
4. Put reusable browser behavior in `hooks/`.
5. Define or extend the data model in `types/` before adding structured content.
6. Keep English and Chinese content structurally synchronized.
7. Use Tailwind utilities and the feature's existing style ownership pattern.
8. Run typecheck/build and browser regression before merging.

Known deliberate exceptions:

- `LeaderPage.tsx` keeps its localized content and page-only layout together.
- `PublicationPage.tsx` keeps recent-publication and author-link subcomponents locally because they share page-specific lookup/scroll state.
- The two Workshop article components are large static content documents; shared behavior and styling are still extracted.

## Visual fidelity contract

The migrated UI is a locked visual contract.

- Baseline route families: Home, Leader, Publication, Workshop, People, News, and Project.
- Validate English and Chinese at desktop `1440 x 1000` and mobile `390 x 844`.
- The baseline matrix is 7 route families x 2 locales x 2 viewports = 28 settled-state screenshots.
- Also smoke-test the Japan Times and Nature article routes because they share `NewsArticleContent`.
- Freeze animated media and CSS animation to the same frame before pixel comparison.
- Verify dynamic media asset hashes separately.
- A visual-preservation refactor is accepted only when deterministic comparisons report zero changed pixels.
- For an intentional design change, document the changed routes and compare unaffected routes against the same baseline.

At minimum, run:

```bash
npm run typecheck
npm run build
git diff --check
```

Then verify the affected English/Chinese routes in a real browser at both documented viewports, including interactive states and browser-console errors.

## Deployment

Pushing `main` runs `.github/workflows/deploy-pages.yml`.

The workflow:

1. checks out the exact commit;
2. installs dependencies with the repository lockfile;
3. runs the checked Vite build;
4. packages `build/`;
5. uploads the artifact over SSH;
6. invokes `/home/ubuntu/mc2-lab-deploy.sh` on the production server.

Deployment is serialized by the `mc2-lab-deploy` concurrency group. Do not manually replace the production directory when the GitHub Actions release path is available. After the workflow succeeds, verify the production URL and its interactive states rather than treating a green build alone as completion.
