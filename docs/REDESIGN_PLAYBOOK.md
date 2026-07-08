# La Muralla — Redesign Request Playbook

> **Purpose**: this file captures the *recurring pattern* behind how the user asks for view/page redesigns in this repo — what "mejora esta vista" actually means in practice, based on the full back-and-forth of the `/gemini/chat` and `/config` redesign sessions. Read this **before** starting any "reorganiza/mejora/redisenya la ruta X" request — it will save several rounds of feedback.
>
> Companion file: [`docs/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the token/recipe reference (colors, radii, button recipes, icon rules). This file is about *process and recurring judgment calls*, not tokens.

---

## 0. The meta-pattern

The request is almost always the same shape, whether or not it's spelled out in full:

> "Take route/component X, and make it look and be structured like [reference route(s)], because right now it doesn't match."

The user drives this **iteratively with screenshots**, not with an exhaustive spec up front. Expect 2–4 rounds of feedback per view, each pointing at one concrete visual problem. The goal of this playbook is to front-load the review items below so the *first* pass already satisfies most of them, instead of discovering them one screenshot at a time.

**Reference routes** (the canonical "this is what good looks like" pages, in order they were established):
- `/tableros` (`src/app/(protected)/tableros/page.tsx`) — plain top-level list page: bare `h1` + subtitle header, action buttons top-right, full-width grid of real cards, whole-page infinite scroll.
- `/factory` (`src/app/(protected)/factory/page.tsx`, `factory/[id]/page.tsx`) — same list pattern, plus the "detail page" variant (icon roundel + 24px h1 + subtitle, `CustomSwitch` tabs below).
- `/gemini/chat` (`src/components/partials/gemini/ChatWithIA.tsx`) — the full-bleed, no-card immersive layout pattern (chat/canvas-style views).
- `/config` (`src/app/(protected)/config/*`) — the multi-tab settings-panel pattern (nested `CustomSwitch`, unified CRUD views).
- `/tableros/[id]` (`src/app/(protected)/tableros/[id]/page.tsx`) — the "detail page with tabs, but each tab is a full working view" variant: same icon-roundel header as `factory/[id]` (bound to the real entity's name/description, never a generic placeholder like "Detalles del Tablero"), `CustomSwitch` tabs below, **no `maxWidth` cap** (full-bleed like `/tableros`), and — critically — none of the tab content (`SprintBoard`/`SprintKanbanCard`, `SprintList`, `DiagramaGantt`) is wrapped in its own `shadow-border`/`radius-xl` card. See §2.4 below for why this one was easy to get wrong.

When asked to redesign a new view, **name which of these four it's most structurally similar to** and mirror that one specifically, rather than inventing a new layout.

---

## 1. Checklist — run through this before calling a redesign "done"

Every one of these was a real round of feedback in this repo. Check all of them proactively.

### Structure
- [ ] Page header matches the reference **exactly**: `h1` at `fontSize: 28, letterSpacing: "-1.1px"` + a plain `p` subtitle at `fontSize: 14, color: var(--ds-text-secondary)`. No icon roundel on top-level list pages (icon roundels are only for "detail" sub-pages, e.g. `factory/[id]`).
- [ ] No hardcoded `maxWidth` / width caps that don't exist on the reference page. If `/tableros` stretches full-width, the new page must too.
- [ ] Tab navigation reuses the shared **`CustomSwitch`** component (`src/components/ui/CustomSwitch.tsx`) — underline-style, text-only tabs. Never hand-roll a pill/button tab bar. Tabs can nest (page-level tabs + a second `CustomSwitch` inside a tab's content) — this is an established pattern, not a hack.
- [ ] If a feature has its own natural home in the app chrome (e.g. **notification preferences belong near the notification bell in the Topbar**, not buried in a generic settings page), question whether it should even live where it currently does before restyling it in place. Ask "does this belong here at all?", not just "how should this look?".

### The "boxed card" anti-pattern (came up on *every* view redesigned so far)
- [ ] **Never wrap an entire page section (header + tabs + content) in one big `rounded-xl` + `shadow-border` card.** That reads as "a floating widget in a sea of whitespace," which the user flags immediately, every time.
- [ ] `boxShadow: var(--shadow-border)` + `borderRadius: var(--radius-xl)` is reserved for **actual individual content items** — a status card, a user card, a role card, a board card. It is never applied to a header row, a nav row, or a whole-section wrapper.
- [ ] Section headers (e.g. "Estados de Proyectos" above a grid) are a plain flex row — title + subtitle on the left, action button on the right — with **no background, no border, no shadow**. Copy the exact shape of `/tableros`' header/action row.
- [ ] Bounded lists (e.g. a scrollable list inside a page, not a modal) do not need a wrapping card either — a single `borderTop: 1px solid var(--ds-border)` divider before the list is enough; let individual rows/cards provide the visual structure.

### Content presentation
- [ ] Icons are **always `lucide-react`**, in a small colored roundel (`background: var(--X-100/200)`, `color: var(--X-900)`) when representing a category/entity. **Never emoji** as functional icons (this was an explicit fix: a capabilities grid using 📄🔎🧮📋 was replaced with `FileSearch`/`ScanSearch`/`Calculator`/`FileCheck` in colored roundels).
- [ ] When a view manages "real entities" (statuses, users, roles, boards), **each entity is its own bordered/shadowed card** — not a flat `divide-y` row with no visual boundary, and not a single wall-of-text list. If an equivalent card pattern already exists elsewhere in the app for the same kind of entity (e.g. user cards in `src/components/partials/factory/UsersOrg.tsx`), **reuse that exact pattern** rather than inventing a new one.
- [ ] Card grids use a layout that **actually fills the available width** — prefer `style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}` over a small number of hardcoded Tailwind breakpoint columns, *unless* the user has explicitly asked for a hard cap (see next point).
- [ ] ...but if uneven content (e.g. one role with 39 permissions vs. others with 5) makes an `auto-fill` grid look broken — rows stretch to the tallest card, leaving huge gaps in the others — **fix both problems together**: cap the grid at a sensible max column count (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) **and** truncate the card's long content to N items + a `+N más` overflow chip, so row heights stay balanced. Don't just cap the grid and leave lopsided cards.
- [ ] A long flat list of tags/chips (e.g. 30+ permission names) should be **grouped by category** (parse a naming convention like `RESOURCE_ACTION` → group by `RESOURCE`) with a small `.mono-label` header per group, not left as one undifferentiated wall of chips.
- [ ] Related CRUD flows that are conceptually one thing (e.g. "roles" and "the permissions assigned to them") should usually be **one unified view**, not split across separate tabs, if the user's own domain description treats them as one ("cada rol con sus permisos asignados, y el CRUD de permisos ahí mismo").

### Spacing
- [ ] Don't leave a scrollable/immersive area (chat, canvas) cramped against its input dock or top bar — give generous padding (`pt-6 pb-8` style) so it doesn't feel like content is "stuck to the edge."
- [ ] Don't vertically center a hero/empty-state so aggressively that it creates a huge, awkward, asymmetric gap between the header and the content — size the hero content itself up (bigger icon, bigger heading) so it earns the space it occupies, rather than floating small in a large empty area.

---

## 2. Bug classes specific to this app's modal system

Two distinct bugs came up, both root-caused to the same underlying fact: **`Modal.tsx`'s content (`<main className="flex-1 min-h-0 overflow-y-auto">`) is a scrolling, `transform`-animated (framer-motion) container.**

### 2.1 Dropdowns/pickers inside a modal get clipped and trigger the modal's scrollbar
**Symptom**: a custom `<select>`-like dropdown or color picker, positioned `absolute` inside a `relative` wrapper, gets visually cut off and causes the modal to scroll instead of the panel floating above the content.

**Root cause**: `position: absolute` is clipped by the modal's `overflow-y-auto` ancestor. Simply switching to `position: fixed` **without also portaling the node out of the modal's DOM tree is not enough** — the modal's `motion.section` animates with a CSS `transform`, and a `transform` on an ancestor creates a new containing block for `fixed` descendants, so `fixed` alone still gets trapped inside the modal.

**The fix** (established, working reference: the status dropdown in `src/components/partials/boards/CreateBoardForm.tsx`):
1. `createPortal(dropdownJsx, document.body)` — moves the DOM node itself out from under the modal's transformed ancestor.
2. Position it with `className="fixed z-[9999]"` + inline `top`/`bottom`/`left`/`width` computed from `computeDropdownPosition()` (`src/lib/utils/dropdown.utils.ts`), which also flips the panel upward if there isn't room below.
3. Close the dropdown on `window.addEventListener('scroll', ..., true)` — a fixed-position portal doesn't track the trigger's position during scroll, so just close it instead of trying to keep it glued.
4. If the component has click-outside-to-close behavior, the outside-click check must test **both** the trigger's ref **and** a second ref on the portaled panel — once portaled, the panel is no longer a DOM descendant of the trigger, so a naive single-ref `.contains()` check would immediately (and wrongly) treat clicks inside the panel as "outside."

Fixed so far under this pattern: `src/components/ui/ColorPicker.tsx`, `src/components/partials/config/users/EditUserForm.tsx`, `src/components/partials/config/users/CreateUserFormConfig.tsx`. Apply the same treatment to any other `absolute`-positioned dropdown discovered inside a modal (e.g. anything else built before this pattern was established).

### 2.2 A card/list clips at the bottom and shows an unexpected scrollbar
**Symptom**: a grid of cards visually cuts off partway through, as if a `div` were trimming it.

**Root cause**: an internal, hand-rolled bounded scroll container (`max-h-[calc(100vh-Xrem)] overflow-y-auto` + a manual `scroll` event listener on a `ref`) — a leftover pattern from before the app standardized on whole-page infinite scroll. The hardcoded height guess doesn't account for how much vertical space the surrounding header/tabs/search-bar actually consume, so it clips.

**The fix**: use the canonical whole-page pattern instead — `useInfiniteScroll` (`src/lib/hooks/useInfiniteScroll.ts`), which binds to `#app-scroll-container` (the real scrolling ancestor set up by `ConditionalLayout.tsx`), not to a manufactured inner box. Remove the fixed-height wrapper entirely; let the grid flow with the page. Reference implementation: `src/app/(protected)/tableros/page.tsx`. Also add the standard trailing states per `docs/DESIGN_SYSTEM.md` §2.9: a "Cargando más…" spinner while loading, and "No hay más… para mostrar" once exhausted.

**Rule of thumb**: any time you see `max-h-[calc(100vh-...)]` combined with a manual scroll-event `ref` in this codebase, it's almost certainly this same legacy pattern and should be converted to `useInfiniteScroll` bound to the page, not patched in place.

### 2.3 Clicking a `CustomSelect` (or any custom dropdown trigger) inside a modal form closes the whole modal
**Symptom**: a form rendered inside a modal uses `CustomSelect` (`src/components/ui/CustomSelect.tsx`) for one of its fields; clicking the select's trigger — before even picking an option — immediately closes the modal instead of opening the dropdown.

**Root cause**: the field is inside a `<form onSubmit={...}>`, and `<button>` elements default to `type="submit"` when no `type` is specified. `CustomSelect`'s internal trigger button and its option buttons didn't declare `type="button"`, so clicking the trigger submitted the form as a side effect. Submit handlers in this app commonly end with `closeModal()` (see the `Modal.tsx`/`useModalStore` pattern), so the modal closed before the user could interact with the dropdown at all. This had never surfaced before because `CustomSelect`'s only prior usage (`TaskDetailsForm.tsx`'s inline task filters) isn't nested inside a `<form>`.

**The fix**: `CustomSelect.tsx` now declares `type="button"` on all five of its internal `<button>`/`<motion.button>` elements (the trigger, the three `renderOption` variants, and the "clear selection" row). This is fixed at the shared-component level, so any other consumer is automatically safe — but it's worth remembering as a class of bug: **any custom interactive control (button-based dropdown, stepper, toggle) added inside a `<form>` needs an explicit `type="button"` on every non-submit `<button>`**, or it will silently trigger the form's `onSubmit`.

### 2.4 A "detail page with tabs" whose *tab content itself* gets wrapped in a card (found in `/tableros/[id]`)
**Symptom**: a detail page (icon roundel header + `CustomSwitch` tabs, e.g. `/tableros/[id]`) looks like a stack of floating white boxes — the header is one card, and each tab's main content (a Kanban board, a sprint list) is *also* its own `shadow-border`/`radius-xl` card sitting right underneath, with a hard `maxWidth` capping the whole page so it doesn't even use the available width.

**Root cause**: this is the same "boxed card" anti-pattern from §1, but easy to miss on a detail-page-with-tabs layout specifically, because `factory/[id]`'s header genuinely does use an icon roundel (which reads as "card-like" at a glance), which can make it feel consistent to also box the tab content below it. It isn't — the icon roundel is a small header treatment, not license to box the whole page. The rule from §1 still applies at full strength: **only individual content items get `shadow-border` + `radius-xl`** (an issue card, a sprint-row card in the Lista tab) — never the single, page-filling "current view" a tab renders (the whole Kanban board, the whole Gantt panel).

**The fix** (applied to `/tableros/[id]`, `SprintBoard.tsx`, `SprintKanbanCard.tsx`, `DiagramaGantt.tsx`):
1. Header mirrors `factory/[id]` exactly: icon roundel + `h1`/`p` bound to the *real* entity's name/description (never a generic placeholder string — if `/gemini`'s header taught us to bind real copy, the same applies here: `selectedBoard?.name`, not `"Detalles del Tablero"`), status badge inline with the `h1`, `CustomSwitch` tabs on their own row below.
2. Drop the page's `mx-auto` / hardcoded `maxWidth` — the page's outer `<div>` has no width cap, exactly like `/tableros`.
3. The single per-tab "current view" (the active sprint's Kanban board, the sprint list, the Gantt chart) renders directly against the page background — no `overflow-hidden` + `shadow-border` + `radius-xl` wrapper around the whole thing. A `borderBottom: 1px solid var(--ds-border)` divider between a view's own header row and its body is enough structure; let the *individual* cards inside it (an issue card, a sprint-row card) carry the actual card styling.
4. A secondary "project details" block that only applies to some tabs (e.g. metadata dates, shown only outside the Kanban tab) follows the same rule: de-boxed, separated with a plain `borderBottom` divider, not its own card.

### 2.5 A tab's default view is slow because the initial data fetch also loads data only *other* tabs need
**Symptom**: the tab a page opens on by default (e.g. the Kanban board in `/tableros/[id]`, which needs only the active sprint's issues) takes noticeably long to render, even though the data it actually needs is small. Network tab shows far more requests firing on page load than that view uses.

**Root cause**: the page's single "load everything" effect/store-action fetches data for *every* tab up front and awaits all of it before flipping `isLoading` off — including a full issue fetch **per sprint** plus the backlog, when the default (Kanban) tab only ever renders the one active sprint. Found in `SprintStore.ts`'s `getSprints`: it fetched sprints list → active sprint → then `Promise.all`'d a full issues fetch for *every* sprint (only used by the Lista tab) → then the backlog issues *after* that, serially. The Kanban tab sat behind all of it for data it would never use.

**The fix** (the general shape, not just this one store): split the load into a fast path and a background fill.
1. Fetch just enough to render the *default* view (here: the sprint list + the active sprint's own issues, fetched in its own request) and flip `isLoading` off as soon as that's ready — this is what unblocks the fast tab.
2. Kick off everything only a *secondary* tab needs (here: backlog + every non-active sprint's issues, `loadRemainingSprintIssues`) in the background, **not awaited** by the fast path, and merge it into state once it resolves.
3. Guard the background merge against staleness: capture a generation counter (or equivalent) when the fast path starts, bump it on every new load *and* on any "reset" action (here, `clearSprints()`), and have the background fill check it's still current before writing — otherwise a slow background fetch from a page the user already navigated away from can silently overwrite fresher state. Also skip overwriting anything the user has since fetched more specifically themselves (e.g. a sprint the user applied their own filter to in the Lista tab).
4. If a secondary view's empty-state UI ("no items") can't tell "genuinely empty" apart from "background fill hasn't arrived yet," gate it on a loading flag from the store (`isLoadingSprintDetails` here) so it shows a small loading indicator instead of a false empty state for the second or two the background fill takes.

---

## 3. Reusable component inventory (check before building something new)

| Need | Use this | Not this |
|---|---|---|
| Tab navigation (any level) | `CustomSwitch` (`src/components/ui/CustomSwitch.tsx`) | Hand-rolled pill/button tabs |
| Toggle switch | `Switch` (`src/components/ui/Switch.tsx`) | A custom `<button role="switch">` |
| Delete confirmation | Copy `src/components/partials/boards/DeleteBoardForm.tsx` verbatim | A new dialog layout |
| Create/edit form shell | Copy `src/components/partials/boards/CreateBoardForm.tsx` / `src/components/partials/config/CreateEditStatus.tsx` | Ad hoc input/button styling |
| Dropdown/picker rendered inside a modal | The portal pattern in §2.1 above | `absolute` inside `relative` |
| Empty state | `src/components/ui/EmptyState.tsx`, or the inline icon-in-circle pattern (`w-fit mx-auto p-3 rounded-full`, `background: var(--gray-alpha-100)`) for simpler cases | A bespoke empty state each time |
| Entity card (user/board/org-shaped) | Whatever entity-card pattern already exists for that entity elsewhere (e.g. `src/components/partials/factory/UsersOrg.tsx` for users) | A new visual design per view |

---

## 4. Verification workflow in this environment

There is **no browser available** in this session type — verification is `cd` into the repo + `npm run build` (compiles, typechecks, lints, generates all routes) plus static code reading, never a live render. Always run the build after a redesign pass and read back the actual diff/file content before declaring it done ("trust but verify" — an agent's or your own summary of what changed is not a substitute for reading the resulting JSX). Tell the user explicitly that a manual visual pass is still owed, since screenshots only arrive after the user tests it themselves.

When a task is large (many files across a whole route, e.g. the `/config` token migration), it's reasonable to fan work out to parallel subagents with very concrete, file-scoped briefs — but the *structural* decisions (what the header looks like, whether something should be a card, where tabs come from) should be made by reading this playbook and the reference routes directly, not left to an agent to interpret independently, since those are exactly the judgment calls that trigger feedback rounds.
