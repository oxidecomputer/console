# Principles & setup

- Keep the console a thin client over the Oxide API: minimize client-only state, surface API concepts, and bias toward simple, predictable UI that works everywhere.
- Favor well-supported libraries, avoid premature abstractions, and use routes to capture state.
- Before starting a feature, skim an existing page or form with similar behavior and mirror the conventions—this codebase is intentionally conventional.
- Use Node.js 22+, then install deps and start the mock-backed dev server (skip if `npm run dev` is already running in another terminal):

  ```sh
  npm install
  npm run dev
  ```

# Comment style

- Prefer comments that spell out the motivation, constraints, or quirks behind a block—avoid narrating what the code already says. Good examples call out browser limits, backend caps, or sequencing expectations so future readers know the context, not just the mechanics.

# API utilities

- Treat `app/api/util.ts` (and friends) as a thin translation layer: mirror backend rules only when the UI needs them, keep the client copy minimal, and always link to the authoritative Omicron source so reviewers can verify the behavior.

# Testing code

- Run local checks before sending PRs: `npm run lint`, `npm run tsc`, `npm test run`, and `npm run e2ec`; pass `-- --ui` for Playwright UI mode or project/name filters like `npm run e2ec -- instance -g 'boot disk'`.
- Keep Playwright specs focused on user-visible behavior—use accessible locators (`getByRole`, `getByLabel`), the helpers in `test/e2e/utils.ts` (`expectToast`, `expectRowVisible`, `selectOption`, `clickRowAction`), and close toasts so follow-on assertions aren’t blocked.
- Cover role-gated flows by logging in with `getPageAsUser`; exercise negative paths (e.g., forbidden actions) alongside happy paths as shown in `test/e2e/system-update.e2e.ts`.
- When UI needs new mock behavior, extend the MSW handlers/db minimally so E2E tests stay deterministic; prefer storing full API responses so subsequent calls see the updated state (`mock-api/msw/db.ts`, `mock-api/msw/handlers.ts`).
- Co-locate Vitest specs next to the code they cover; use Testing Library utilities (`render`, `renderHook`, `fireEvent`, fake timers) to assert observable output rather than implementation details (`app/ui/lib/FileInput.spec.tsx`, `app/hooks/use-pagination.spec.ts`).
- For sweeping styling changes, coordinate with the visual regression harness and follow `test/e2e/VISUAL-REGRESSION.md` for the workflow.

# Data fetching pattern

- Define endpoints with `apiq`, prefetch them in a `clientLoader`, then read data with `usePrefetchedQuery`.
- Use `ALL_ISH` when the UI needs every item (e.g. release lists) and rely on `queryClient.invalidateEndpoint`—it now returns the `invalidateQueries` promise so it can be awaited (see `app/pages/system/UpdatePage.tsx`).
- For paginated tables, compose `getListQFn` with `useQueryTable`; the helper wraps `limit`/`pageToken` handling and keeps placeholder data stable (`app/api/hooks.ts:123-188`, `app/pages/ProjectsPage.tsx:40-132`).
- When a loader needs dependent data, fetch the primary list with `queryClient.fetchQuery`, prefetch its per-item queries, and only await a bounded batch so render isn’t blocked (see `app/pages/project/affinity/AffinityPage.tsx`).

# Mutations & UI flow

- Wrap writes in `useApiMutation`, use `confirmAction` to guard destructive intent, and surface results with `addToast`.
- Keep page scaffolding consistent: `PageHeader`, `PageTitle`, `DocsPopover`, `RefreshButton`, `PropertiesTable`, and `CardBlock` provide the expected layout for new system pages.
- When a page should be discoverable from the command palette, extend `useQuickActions` with the new entry so it appears in the quick actions menu (see `app/pages/ProjectsPage.tsx:100-115`).
- Gate per-resource actions with the capability helpers (e.g. `instanceCan.addToAffinityGroup`) and pass a `disabledReason` when disabling buttons so the UI explains why.

# Navigation expectations

- New routes should set `handle` breadcrumbs via `makeCrumb`, hook into the system sidebar, and expose quick actions (`app/layouts/SystemLayout.tsx`).

# Upgrading pinned omicron version

1. Update commit hash in `OMICRON_VERSION`.
2. Run `npm run gen-api`.
3. Run `npm run tsc`.
4. Fix type errors. New endpoints in `mock-api/msw/handlers.ts` should be added as `NotImplemented`.

# Mock API work

- Only implement what is necessary to exercise the UI; keep the db seeded via `mock-api/msw/db.ts`.
- Store API response objects in the mock tables when possible so state persists across calls.
- Enforce role checks with `requireFleetViewer`/`requireFleetCollab`/`requireFleetAdmin`, and return realistic errors (e.g. downgrade guard in `systemUpdateStatus`).

# Routing

- Add routes in `app/routes.tsx`, using `lazy(() => import(...).then(convert))` so loaders become `clientLoader` and components stay tree-shakeable.
- Export navigation helpers via `pb` in `app/util/path-builder.ts`; every new route should get a path-builder entry and appear in `app/util/path-builder.spec.ts`’s snapshot.
- Breadcrumbs come from route `handle.crumb`; use `makeCrumb`/`titleCrumb` and provide a `path` when the parent route redirects (`app/hooks/use-crumbs.ts:21-64`).
- When adding tabs or redirects, wire the canonical link in the path builder (e.g., point to the default tab) and update the sidebar/quick actions as needed.

# Forms

- Forms live under `app/forms`; start by copying a nearby example such as `app/forms/project-create.tsx:21-61`.
- Use `react-hook-form` with the shared shells (`SideModalForm`, `ModalForm`, `FullPageForm`) so UX and submit handling stay consistent (`app/components/form/SideModalForm.tsx:32-140`).
- Wire submissions through `useApiMutation`, invalidate or seed queries with `useApiQueryClient`, and surface success with toasts/navigation (`app/forms/project-create.tsx:34-55`).
- Prefer the existing field components (`app/components/form/fields`) and only introduce new ones when the design system requires it.

# Tables & detail views

- Use shared helpers for IDs: `Columns.id` gives tables a copy button, and `PropertiesTable.IdRow` shows truncated IDs with copy support.
- Compose row actions with `useColsWithActions` and the confirm-action stores; prime modals by seeding list data into the cache (e.g., `queryClient.setQueryData`) so edits open immediately (`app/pages/ProjectsPage.tsx`).
- Let `useQueryTable` drive pagination, scroll reset, and placeholder loading states instead of reimplementing TanStack Table plumbing (`app/table/QueryTable.tsx`).

# Layout & accessibility

- Build pages inside the shared `PageContainer`/`ContentPane` so you inherit the skip link, sticky footer, pagination target, and scroll restoration tied to `#scroll-container` (`app/layouts/helpers.tsx`, `app/hooks/use-scroll-restoration.ts`).
- Surface page-level buttons and pagination via the `PageActions` and `Pagination` tunnels; anything rendered through them lands in the footer bar automatically (`app/components/PageActions.tsx`, `app/components/Pagination.tsx`).
- For global loading states, reuse `PageSkeleton`—it keeps the MSW banner and grid layout stable, and `skipPaths` lets you opt-out for routes with custom layouts (`app/components/PageSkeleton.tsx`).

# Route params & loaders

- Wrap `useParams` with the provided selectors (`requireParams`, `useProjectSelector`, etc.) so required params throw during dev and memoize cleanly for dep arrays (`app/hooks/use-params.ts`).
- Prefer `queryClient.fetchQuery` inside `clientLoader` blocks when the page needs data up front, and throw `trigger404` on real misses so the shared error boundary can render Not Found or the 403 IDP guidance (`app/pages/ProjectsPage.tsx`, `app/layouts/SystemLayout.tsx`, `app/components/ErrorBoundary.tsx`).

# Global stores & modals

- Use the zustand-powered confirm helpers (`confirmDelete`, `confirmAction`) for destructive flows—pass `mutateAsync` lambdas so failures can emit toasts automatically (`app/stores/confirm-delete.tsx`, `app/stores/confirm-action.ts`).
- Toasts live in the global store: call `addToast` with a string, node, or config and let `ToastStack` handle animation and dismissal (`app/stores/toast.ts`, `app/components/ToastStack.tsx`).

# UI components & styling

- Reach for primitives in `app/ui` before inventing page-specific widgets; that directory intentionally holds router-agnostic building blocks (`app/ui/README.md`).
- When you just need Tailwind classes on a DOM element, use the `classed` helper instead of creating one-off wrappers (`app/util/classed.ts`).
- Reuse utility components for consistent formatting—`TimeAgo`, `EmptyMessage`, `CardBlock`, `DocsPopover`, `PropertiesTable`, and friends exist so pages stay visually aligned (`app/components/TimeAgo.tsx`, `app/ui/lib`).

# Docs & external links

- Keep help URLs centralized: add new docs to `links`/`docLinks` and reference them when wiring `DocsPopover` or help badges (`app/util/links.ts`).
