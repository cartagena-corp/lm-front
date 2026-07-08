# La Muralla — Design System Reference

> **Purpose of this document**: this is the single source of truth for the visual design system implemented in this app. If you are a fresh Claude Code session picking up work on this repo, read this file before touching any presentation-layer code. It captures decisions, conventions, and constraints that are **not** self-evident from reading any single component file.
>
> Companion files: [`docs/design-system.html`](./design-system.html) — a single self-contained HTML living style guide that visually renders every token and component recipe described here. Open it directly in a browser (no build step needed). Also see [`docs/REDESIGN_PLAYBOOK.md`](./REDESIGN_PLAYBOOK.md) — the recurring *process* checklist for "reorganiza/mejora esta vista" requests (structure, anti-patterns, known modal/scroll bugs), complementary to this token/recipe reference.

## 0. Non-negotiable constraints (read first)

These were explicit, repeated user directives during the redesign. Do not silently revert any of them:

1. **Light mode only.** Dark mode was fully and deliberately removed from the app. There is no `.dark` class, no `[data-theme="dark"]` selector, no theme toggle UI. Never reintroduce dark-mode branching in CSS or components.
2. **The sidebar background is permanently `#101828`.** It does not change with any setting. It is a fixed brand element, not a themeable surface.
3. **No floating notification widgets.** Notifications live in a dropdown anchored inside the Topbar (`NotificationsDropdown.tsx`), not a floating corner button/panel.
4. **Zero default-Tailwind-palette classes.** No `bg-red-500`, `text-gray-400`, `border-purple-300`, `hover:bg-blue-50`, etc. anywhere in `src/`. Every color is a CSS custom property, either a raw Geist scale step (`var(--red-700)`) or a semantic alias (`var(--ds-text)`). The two intentional exceptions are documented in §1.6.
5. **Icons come from `lucide-react` only.** The old hand-rolled `src/assets/Icon.tsx` icon set and the `public/geist-icons.svg` sprite have been deleted. Do not reintroduce hand-drawn inline `<svg>` icons or a new sprite system — use `lucide-react` and, if a needed icon doesn't exist there, ask before hand-rolling one.
6. **Business logic is out of scope for presentation work.** None of the color/icon/layout changes described here touched API calls, Zustand store logic, or data models. Keep it that way unless explicitly asked.
7. **The app-wide UI language is Spanish.** Don't translate copy when doing presentational refactors.

---

## 1. Color system

All color tokens live in **`src/assets/geist/colors.css`**, loaded once via `src/assets/globals.css`. Every token is a CSS custom property on `:root` — there is no Tailwind `theme.colors` extension for any of this; components consume the variables directly via inline `style={{ color: 'var(--x)' }}` or Tailwind arbitrary-value classes (`text-[var(--x)]`).

### 1.1 Geist scales (10 steps each)

Eight standard Geist-style scales exist: `gray`, `blue`, `red`, `amber`, `green`, `teal`, `purple`, `pink`. Each follows the same step convention:

| Step | Role |
|---|---|
| 100 | default background tint |
| 200 | hover background |
| 300 | active background |
| 400 | default border |
| 500 | hover border |
| 600 | active border |
| 700 | **solid fill** (high contrast — the "main" shade of the color, used for buttons/badges) |
| 800 | solid fill hover |
| 900 | secondary text/icons on that hue |
| 1000 | primary text/icons on that hue (darkest/most saturated) |

`--gray-alpha-100` through `--gray-alpha-1000` are the translucent counterparts of the gray scale (black at increasing opacity: 0.05 → 0.91) — used for borders, dividers, hover overlays, and scrims where a solid gray would clash with whatever's underneath. Solid `--gray-*` is used when you need guaranteed contrast against any background (opaque fills, text).

Full HSL values are in `src/assets/geist/colors.css:12-113`. Read that file directly for exact values — don't hand-copy numbers into new code, reference the variable.

### 1.2 Brand primary scale — `--primary-*`

This is the app's own scale, **not** part of upstream Geist. It's anchored on the brand navy `#101828` and is the single unified recipe for "the one primary CTA button in a view" (see §2.1).

```
--primary-100 … --primary-600   pale → mid navy tints (ghost/outline hover fills, borders)
--primary-700  = #101828         ← exact anchor, solid CTA fill
--primary-800  = hsl(220,38%,18%) solid CTA hover
--primary-900  = hsl(220,45%,7%)  solid CTA active/pressed
--primary-1000 = hsl(220,45%,4%)  reserved, rarely used
--primary-contrast-fg = #f7f8fa   text color for content sitting ON a --primary-700 fill
```

**Why a separate `--primary-contrast-fg` instead of reusing `--ds-contrast-inverse`?** They happen to resolve to visually similar off-white values today, but they are semantically distinct tokens for different surfaces (general "inverse text on any dark ds-surface" vs. "text specifically on the brand-navy CTA fill") — don't merge them, a future retune of one must not silently affect the other.

This scale was introduced specifically to retire **four previously-competing "primary button" recipes** that existed before this redesign: a black/`--gray-1000` invert button, an ad-hoc `--blue-700` + hardcoded `#fff` combo, a raw Tailwind `text-white` className variant, and a `bg-purple-600`-for-edit-mode / `bg-blue-600`-for-create-mode split. All of these have been migrated onto `--primary-700/800/900` + `--primary-contrast-fg`. If you find a new one-off primary-CTA color recipe anywhere, migrate it the same way.

### 1.3 Sidebar scale — `--sidebar-*`

A second, deliberately **separate** fixed namespace, used only by the sidebar rail and its mobile drawer twin:

```
--sidebar-bg            #101828   (fixed, matches --primary-700 by coincidence — do not couple them)
--sidebar-bg-hover      #1c263b
--sidebar-bg-active     #26324a
--sidebar-border        rgba(255,255,255,0.08)
--sidebar-text          #f0f1f5
--sidebar-text-secondary #b6bcc8
--sidebar-text-muted    #8790a1
--sidebar-avatar-bg     #273249
--sidebar-danger-bg     rgba(239,68,68,0.18)   (logout hover-reveal button)
--sidebar-danger-text   #ffb4ab
```

**Why not just reuse `--primary-*` in the sidebar?** The sidebar's hover/active states need to lighten off a *persistent surface* baseline (it's always visible, always dark), while `--primary-*` is tuned as a *CTA* baseline (a button that needs to pop against a light page). Coupling them means a future "make the primary button darker" tweak would silently reshade the sidebar too. Keep them independent.

### 1.4 Semantic aliases — `--ds-*`

These are the aliases most components actually consume day-to-day (defined at the bottom of `colors.css`):

| Token | Resolves to | Use for |
|---|---|---|
| `--ds-background` | `--background-100` (`#fff`) | page background |
| `--ds-background-subtle` | `--background-200` | subtle section backgrounds |
| `--ds-card` | `--background-100` | card/modal/dropdown surfaces |
| `--ds-text` | `--gray-1000` | primary text |
| `--ds-text-secondary` | `--gray-900` | secondary text/labels |
| `--ds-text-muted` | `--gray-700` | muted/placeholder text |
| `--ds-border` | `--gray-alpha-400` | default 1px borders |
| `--ds-border-strong` | `--gray-alpha-500` | emphasized/hover borders |
| `--ds-fill` / `-hover` / `-active` | `--gray-100/200/300` | neutral fill states |
| `--ds-focus` | `--blue-700` | focus rings |
| `--ds-link` | `--blue-700` | link color |
| `--ds-error` | `--red-800` | error text |
| `--ds-warning` | `--amber-700` | warning text |
| `--ds-contrast-inverse` | `--background-100` | text-on-dark-solid-fill (e.g. white text on a `--red-700` delete button) |

### 1.5 Runtime accent — `--accent` / `--accent-fg`

Unrelated to everything above. This is a small, pre-existing, **orthogonal** user preference ("blue" vs "mono" link-color style), stored in `ThemeStore.ts` (Zustand, key `theme-storage`, field `accent`) and applied via `src/components/geist/ThemeScript.tsx` (an anti-FOUC bootstrap script in `<head>`) and `applyThemeToDOM()`. It has exactly two consumers: the login page and `LoginForm.tsx`. Do not touch, remove, or conflate this with the (removed) dark/light theme system — it survived that removal intact and on purpose.

### 1.6 The only two allowed non-token colors

A repo-wide sweep enforces zero raw hex/Tailwind-palette colors, with exactly two confirmed, intentional exceptions:

- `src/components/geist/ThemeScript.tsx` — the accent-color bootstrap script above sets `--accent-fg` to literal `'#fff'` for the "blue" accent option. This is setting a *runtime CSS variable's value*, not a hardcoded UI color — leave it.
- `src/components/ui/TextArea.tsx` — a rich-text editor color-picker palette includes a literal `{ name: 'Blanco', hex: '#ffffff' }` swatch. This is user-facing *content* color data (what color the user's text becomes), not UI chrome — leave it.

Everything else — including backend-driven status/priority/type chip colors (`getStatusStyle`/`getTypeStyle`/`getPriorityStyle` helpers with a hex fallback like `#6B7280`) — is intentionally left as **inline, data-driven** color, not tokenized, because it's controlled by admin-configurable backend data, not a design decision. Don't "fix" these into tokens; that's an established, correct pattern, not a leftover.

---

## 2. Component recipes

There is no component library / design-system package — these are conventions repeated by hand across ~150 component files. When adding a new component, match the recipe for its category exactly rather than improvising a new one.

### 2.1 Buttons

**Primary** (the *one* main call-to-action per view/form — "Crear", "Guardar", "Confirmar", "Invitar"):
```
bg-[var(--primary-700)] hover:bg-[var(--primary-800)]
text-[var(--primary-contrast-fg)]
focus ring / active state → var(--primary-900)
```

**Danger** (delete/destroy confirmations):
```
bg-[var(--red-700)] hover:bg-[var(--red-800)]
color: var(--ds-contrast-inverse)
focus-visible:outline-2 focus-visible:outline-[var(--red-700)] focus-visible:outline-offset-2
```
Canonical example: `src/components/partials/boards/DeleteBoardForm.tsx` — the whole app's delete-confirmation dialogs copy this file's structure (icon roundel + title + red-emphasized target name + Cancel/Eliminar button pair).

**Secondary / Cancel**:
```
bg-[var(--ds-card)] hover:bg-[var(--gray-alpha-100)]
color: var(--ds-text)
boxShadow: var(--shadow-border)
focus-visible:outline-2 focus-visible:outline-[var(--blue-700)] focus-visible:outline-offset-2
```

**Danger hover-accent** (an icon-only delete trigger inside a row/list, not a full button):
```
hover:bg-[var(--red-100)] hover:text-[var(--red-900)]
```

**Ghost icon button** (topbar icons, kebab menus):
```
hover:bg-[var(--gray-alpha-100)]
rounded-md, transition-colors
```

Standard control height: `h-9` (36px) for compact form buttons, matching `--control-height-*` isn't strictly followed everywhere (many buttons use ad-hoc `h-9`/`h-10`/`h-11` rather than the `--control-height-small/medium/large` tokens) — when writing new components, prefer the token where practical, but don't do a mechanical retrofit sweep just to swap `h-9` for `var(--control-height-small)` unless asked.

**Critical CSS gotcha learned the hard way**: a hover-affecting color must be a Tailwind class (`hover:bg-[var(--gray-alpha-100)]`), never inside an inline `style={{}}` object — inline styles always win specificity over `:hover` pseudo-class rules, so a hover intended via `style` silently never fires.

### 2.2 Cards / surfaces

```
background: var(--ds-card)
boxShadow: var(--shadow-border)   /* "shadow-as-border" — see §3 */
border-radius: var(--radius-md)  /* 6px, the default for buttons/inputs/cards */
```
Hover-lift (where a card should visibly raise on hover): swap to `var(--shadow-md)` on `:hover`.

### 2.3 Inputs

```
height: 40-44px (h-10/h-11), rounded-md
background: var(--ds-card), boxShadow: var(--shadow-border)
focus-within:outline-2 focus-within:outline-[var(--blue-700)] focus-within:outline-offset-2
placeholder: var(--ds-text-muted)
```
Note: input focus uses `--blue-700`, not `--primary-700` — the brand-navy primary scale is reserved for CTA buttons, not general focus states. Focus rings app-wide stay blue.

### 2.4 Modals

Shared wrapper: `src/components/new_layout/Modal.tsx`. Structure is `flex flex-col`, `max-h-[95vh]`, with an inner `flex-1 min-h-0 overflow-y-auto` content pane so a pinned header/tab-nav can sit above a scrolling body. **Any modal with its own internal tab navigation must replicate this `flex-shrink-0` header + `flex-1 min-h-0 overflow-y-auto` body split** — the most common layout bug found during the redesign was a modal where this was missing, causing the whole modal (including its tab bar) to scroll as one block instead of pinning the tabs. See `ProjectConfigModal.tsx` for a corrected reference example.

### 2.5 Delete-confirmation dialogs

Every `Delete*Form.tsx` in the codebase (there are ~20) follows the exact same template: a centered `w-16 h-16 rounded-full` icon roundel in `var(--red-100)` bg / `var(--red-900)` icon color containing a `Trash2` lucide icon, a centered heading + description with the target's name bolded in `var(--red-700)`, then a `Cancel` / `Eliminar` button pair per §2.1. Copy this template verbatim for any new delete confirmation — don't design a new one.

### 2.6 Sidebar (`src/components/new_layout/Sidebar.tsx`)

Two renderings sharing one `sidebarLinks` data array:
- **Desktop rail** (`hidden md:flex`): a collapsible 64px↔256px rail (`motion.aside`, width animated via `motion/react`), permanently `var(--sidebar-bg)`. Nav links use `--sidebar-bg-active`/`--sidebar-bg-hover`/`--sidebar-text-secondary`. Logo is hardcoded to `/favicon-light.ico` (the light/white castle mark) — **always**, regardless of any theme setting, because the sidebar background never changes and is always dark.
- **Mobile drawer** (`md:hidden`): a full-width-label slide-over (`AnimatePresence` + `motion.aside`, `w-[260px] max-w-[80vw]`), triggered by a hamburger button in `Topbar.tsx` via `useSidebarStore().toggleMobileSidebar()`. Auto-closes on route change and backdrop click. `isMobileOpen` state lives in `src/lib/store/SidebarStore.ts` and is deliberately **not** persisted to localStorage (`partialize: (state) => ({ isCollapsed: state.isCollapsed })` — only the desktop collapse preference persists).

Sidebar link icons are typed as lucide's own `LucideIcon` type (`SidebarLinkProps.Icon: LucideIcon`), not a custom function-prop shape — this matters if you add new items to `sidebarLinks`.

### 2.7 Topbar (`src/components/new_layout/Topbar.tsx`)

Sticky header, `h-14`, translucent blurred background (`color-mix(in srgb, var(--ds-background) 80%, transparent)` + `backdrop-filter: blur(8px)`). Contains, left-to-right: mobile hamburger (`md:hidden`, opens the sidebar drawer), a breadcrumb trail (`hidden sm:flex`, built from the current route in `crumbsFor()`), a search box (`hidden md:flex`, ⌘K/Ctrl+K focuses it), and `<NotificationsDropdown />` on the right. There is **no** theme-toggle button — that slot was repurposed for notifications when dark mode was removed.

### 2.8 Notifications (`src/components/layout/NotificationsDropdown.tsx`)

An inline `position: relative` dropdown anchored to a Topbar icon button (unread-count badge), not a floating corner widget. Panel is `absolute right-0 top-full mt-2`, width `w-[min(24rem,calc(100vw-3rem))]` (never wider than the viewport minus a 3rem margin), `max-h-[70vh] overflow-hidden` with an internal scrolling list. Closes on outside click via a ref.

### 2.9 Pagination — infinite scroll, not page numbers

**The app-wide convention for any paginated list is infinite scroll.** A numbered pager (`« 1 2 3 4 »` with page-jump buttons) is a previously-competing pattern that has been retired — `src/components/ui/Pagination.tsx` was deleted for this reason. Do not reintroduce page-number UI for a new list; wire it to infinite scroll from the start.

There are two supported shapes, chosen by where the list scrolls:

**Whole-page lists** (the list's ancestor is the page body, which scrolls the window) use the shared hook `src/lib/hooks/useInfiniteScroll.ts`:
```ts
useInfiniteScroll({
   loading: isLoading || isLoadingMore,
   hasMore: hasMoreX,
   onLoadMore: handleLoadMore,
   threshold: 100 // px from the bottom of the document that triggers the next load
})
```
It listens on `window`'s scroll event and fires `onLoadMore` once `scrollTop + clientHeight >= scrollHeight - threshold`. Reference implementations: `src/app/(protected)/tableros/page.tsx` (boards list) and `src/components/partials/gemini/GeminiUseHistory.tsx`.

**Lists inside a bounded scroll container** (a modal, a fixed-height panel — anything with its own `overflow-y-auto`, not the page body) attach the same threshold check directly to that container's `scroll` event instead of `window`, since the shared hook only listens on `window`. Reference implementation: `src/components/partials/comments/ShowComments.tsx` (`scrollContainerRef` + a `handleScroll` effect, throttled to avoid firing on every scroll tick).

**Store-side shape**, followed by every list that supports this (`BoardStore.getBoards`, `CommentStore.loadMoreComments`, `GeminiStore.getHistory`): the fetch action takes an `append: boolean` (or a dedicated `loadMoreX` action) that, when true, concatenates the new page onto the existing `content` array instead of replacing it, and sets a separate `isLoadingMore` flag rather than the initial-load `isLoading` (so the existing rows stay visible with a small loading indicator appended below them, instead of the whole list flashing to a skeleton). `hasMoreX` is derived from the paginated response as `data.number < data.totalPages - 1`, not tracked by hand.

UI-side, every infinite-scroll list shows the same three states below its rows: an inline spinner + "Cargando más…" while `isLoadingMore`, a muted "No hay más… para mostrar" once `hasMoreX` is false, and nothing else — no page-count footer, no jump-to-page control.

---

## 3. Materials — radii, borders, shadows, motion

Source: `src/assets/geist/materials.css`. Philosophy: **"border-first."** Static elements are defined by a 1px border or a zero-offset 1px-spread shadow ("shadow-as-border": `--shadow-border: 0 0 0 1px var(--ds-border)`), never a soft drop-shadow. Real box-shadow (blur + offset) is reserved for hover states and things visually lifted above the content plane (popovers, modals, dropdowns). **Don't mix rounded and sharp corners in the same view.**

```
--radius-sm    4px
--radius-md    6px    ← default: buttons, inputs, cards
--radius-lg    8px
--radius-xl    12px   ← image cards, larger surfaces
--radius-2xl   16px
--radius-full  9999px ← pills, toggles, avatars

--shadow-border          0 0 0 1px var(--ds-border)
--shadow-border-strong   0 0 0 1px var(--ds-border-strong)
--shadow-sm / -md / -lg / -xl   elevation stack (border + lift + ambient) for hover / modals / popovers, escalating in that order

--focus-ring   0 0 0 2px var(--ds-background), 0 0 0 4px var(--ds-focus)   (2px surface gap, then a 2px blue ring)

--ease-standard / -out / -in    cubic-bezier easing curves
--duration-fast   120ms
--duration-base   180ms
--duration-slow   280ms
```

---

## 4. Typography

Source: `src/assets/geist/typography.css` + utility classes in `src/assets/geist/base.css`.

- **Geist Sans** (`--font-sans`) for all UI and prose. **Geist Mono** (`--font-mono`) for code, data, tabular figures, technical labels. Loaded via `next/font/google` in `src/app/layout.tsx`.
- Three weights only: `400` (read/body), `500` (interact/label), `600` (announce/heading). Hierarchy comes from **size + letter-spacing**, not weight — negative tracking increases at larger display sizes.
- Three scale families, each with matched size/line-height pairs (and letter-spacing for headings): `--heading-{14…72}-*`, `--label-{12…20}-*`, `--copy-{13…24}-*`. Utility classes `.heading-N`, `.label-N`, `.copy-N` apply size+line-height+weight as a unit (see `base.css:38-80`).
- `.mono-label` — uppercase, tracked, tabular Geist Mono label (used for small technical/category tags).
- Most components in this app do NOT use the `.heading-N`/`.copy-N` utility classes directly — they use raw Tailwind text-size classes (`text-sm`, `text-lg`, etc.) with inline `style={{color: 'var(--ds-text)'}}`. Both are valid; the token scale exists for when you need a specific display/heading size not well-served by Tailwind's default scale.

---

## 5. Spacing & layout

Source: `src/assets/geist/spacing.css`. 4px base grid: `--space-0` through `--space-48` (0 → 192px). Control heights: `--control-height-small` (32px), `-medium` (40px), `-large` (48px). Container widths `--container-sm` (640px) through `--container-2xl` (1400px). Page gutter `--gutter: 24px`.

**Responsive breakpoints in practice** (standard Tailwind, no custom breakpoints added): `sm` (640px) mostly used for "shorten label / start showing secondary UI"; `md` (768px) is the sidebar rail / mobile-drawer cutover point and the general "tablet and up" threshold; `lg` (1024px) is used for side-panel-becomes-row layouts (e.g. task detail's metadata sidebar).

**Scroll-container pattern** (a recurring bug class found and fixed across the app): a `flex flex-col` ancestor chain needs `min-h-0` at **every level**, not just the scrolling element itself, or a descendant's `overflow-y-auto` silently does nothing and the container just grows to fit content instead of scrolling. If you add a new scrollable pane inside a flex layout, verify `min-h-0` (or an explicit bounded height) exists on every flex ancestor between the scrolling element and the nearest fixed-height container.

---

## 6. Icon system

**All icons are `lucide-react`** (installed, `^1.23.0`). The legacy hand-rolled icon set (`src/assets/Icon.tsx`) and sprite (`public/geist-icons.svg` + `GeistSprite.tsx`) have been fully deleted — do not recreate either pattern.

### 6.1 The stroke-width gotcha

Lucide components take `size` and **`strokeWidth`** (not `stroke` — that prop controls stroke *color* on a lucide icon, not width; this is a classic silent-regression trap). This app's characteristic icon weight is **`strokeWidth={1.5}`** — always pass it explicitly; lucide's own default is `2`, which reads slightly heavier/less refined than the rest of the UI. A small set of icons intentionally use other explicit weights (`1.75` in some sidebar/topbar contexts, `2` for a few emphasis icons) — match whatever's already used in context you're extending, and when in doubt use `1.5`.

Two categories need **no** explicit `strokeWidth` override because their pre-migration default already happened to equal lucide's own default of 2: the audit/factory-style icons (`ClipboardCheck`, `Factory`) when called with no override, and the 9 rich-text-toolbar icons (`Bold`, `Italic`, `Strikethrough`, `Code`, `Underline`, `Palette`, `Highlighter`, `RemoveFormatting`, and the `BarChart3` used as a mini dashboard glyph).

### 6.2 Full legacy-name → lucide mapping (for historical reference / consistency)

If you encounter old branch diffs, docs, or need to resolve what an old `Icon.tsx` name meant, here's the full mapping applied during migration:

| Old name | lucide-react | Notes |
|---|---|---|
| BoardIcon | `LayoutDashboard` | |
| FilterIcon | `Filter` | |
| CalendarIcon | `Calendar` | |
| LogoutIcon | `LogOut` | |
| XIcon | `X` | |
| ClockIcon | `Clock` | |
| PlusIcon | `Plus` | |
| MenuIcon | `MoreVertical` | **Not** lucide's `Menu` — this icon renders 3 stacked dots (a "more options" kebab), not a hamburger. Lucide's `Menu` is reserved for the actual mobile hamburger button. |
| ListIcon | `List` | |
| EditIcon | `Pencil` | |
| AlertCircleIcon | `AlertCircle` | |
| UsersIcon | `Users` | |
| SendIcon | `Send` | |
| AttachIcon | `Paperclip` | |
| DownloadIcon | `Download` | |
| DeleteIcon | `Trash2` | most-used icon in the app |
| ConfigIcon | `Settings` | |
| BellIcon | `Bell` | |
| MegaphoneIcon | `Megaphone` | |
| EmptyStateIcon | `Inbox` | default size was 48, not 24 |
| AuditIcon | `ClipboardCheck` | no strokeWidth override needed |
| EyeIcon | `Eye` | |
| EyeOffIcon | `EyeOff` | |
| ForbiddenIcon | `Ban` | |
| CheckmarkIcon | `CircleCheck` | check-in-a-circle shape — not lucide's bare `Check` |
| SidebarOpenIcon | `PanelLeftOpen` | |
| SidebarCloseIcon | `PanelLeftClose` | |
| IAIcon | `Sparkles` | general "AI" glyph |
| ChatIAIcon | `Bot` | chat-specific AI glyph, kept visually distinct from IAIcon |
| ImportIcon | `Upload` | |
| FactoryIcon | `Factory` | no strokeWidth override needed; **watch for name collisions** with local components/pages literally named `Factory` — alias the import (`Factory as FactoryIcon`) if so |
| KeyIcon | `KeyRound` | |
| ChevronRightIcon | `ChevronRight` | |
| ArrowRightIcon | `ArrowRight` | |
| LinkRedirect | `ExternalLink` | |
| ChangeIcon | `ArrowLeftRight` | |
| CopyIcon | `Copy` | |
| DocumentIcon | `FileText` | |
| RefreshIcon | `RefreshCw` | |
| BoldIcon | `Bold` | no strokeWidth override needed |
| ItalicIcon | `Italic` | no strokeWidth override needed |
| StrikethroughIcon | `Strikethrough` | no strokeWidth override needed |
| CodeIcon | `Code` | no strokeWidth override needed |
| UnderlineIcon | `Underline` | no strokeWidth override needed |
| PaletteIcon | `Palette` | no strokeWidth override needed |
| HighlighterIcon | `Highlighter` | no strokeWidth override needed |
| RemoveFormatIcon | `RemoveFormatting` | no strokeWidth override needed |
| DashboardIcon | `BarChart3` | no strokeWidth override needed; resolves former collision with BoardIcon |
| ZoomInIcon | `ZoomIn` | |
| ZoomOutIcon | `ZoomOut` | |
| ZoomResetIcon | `RotateCcw` | |
| PlayIcon | `Play` | fill-based — pass `fill="currentColor"` explicitly, lucide's default `Play` is a hollow outline |

Former sprite icons (`#geist-*`, now removed): `arrow-left` → `ArrowLeft`, `magnifying-glass` → `Search`, `inbox` → `Mail` (retargeted to the more semantically-correct email-field icon), `lock-closed` → `Lock`, `arrow-right` → `ArrowRight`.

### 6.3 Adding a new icon

1. Check the icon exists: `ls node_modules/lucide-react/dist/esm/icons/ | grep <kebab-case-name>`.
2. Import by its exact PascalCase export name from `"lucide-react"`.
3. Always pass an explicit `strokeWidth` (default to `1.5` unless matching a specific nearby convention).
4. If the icon is fill-based/solid (rare — only `Play` so far), pass `fill="currentColor"` explicitly.
5. Check for name collisions with local components/variables before importing (TypeScript will error at build time if there's a collision — `npm run build` catches this, unlike the strokeWidth issue).

---

## 7. File map

```
src/assets/geist/colors.css       — all color tokens (§1)
src/assets/geist/typography.css   — font tokens (§4)
src/assets/geist/spacing.css      — spacing/layout tokens (§5)
src/assets/geist/materials.css    — radii/shadow/motion tokens (§3)
src/assets/geist/base.css         — resets + typography utility classes
src/assets/globals.css            — imports all of the above, plus any truly global overrides

src/components/geist/ThemeScript.tsx   — anti-FOUC bootstrap for the --accent runtime var (NOT dark mode — that's gone)
src/components/geist/HydrationNoiseFilter.tsx — dev-only console.error filter for browser-extension DOM-injection noise (see §8)

src/components/new_layout/Sidebar.tsx        — sidebar rail + mobile drawer (§2.6)
src/components/new_layout/Topbar.tsx         — sticky header (§2.7)
src/components/new_layout/ConditionalLayout.tsx — wires the responsive app shell together
src/components/new_layout/Modal.tsx          — shared modal wrapper (§2.4)
src/components/layout/NotificationsDropdown.tsx — Topbar-anchored notifications (§2.8)

src/lib/store/SidebarStore.ts   — isCollapsed (persisted) + isMobileOpen (not persisted)
src/lib/store/ThemeStore.ts     — accent preference only (dark/light theme removed)
```

---

## 8. Known non-design-system quirks worth knowing about

- **Hydration console-noise filter**: `src/components/geist/HydrationNoiseFilter.tsx`, mounted first in `<head>` in `layout.tsx`, monkey-patches `console.error` in dev only to swallow known browser-extension DOM-injection hydration warnings (`bis_skin_checked` and similar attributes injected by extensions like Bitdefender before React hydrates). This is a deliberate, user-requested workaround for false-positive noise — it is not hiding a real app bug, and it's scoped to `process.env.NODE_ENV !== "production"`.
- **No browser-automation tool was available** during the redesign session — all verification was `npm run build` (compiles + typechecks + lints + generates all routes) plus static reasoning. **A manual visual QA pass is still owed**, especially: icon stroke-weight consistency (the one regression class a build can't catch), primary-button contrast on the new navy fill, and the mobile sidebar drawer / notifications dropdown / responsive stacked-card fallbacks.
