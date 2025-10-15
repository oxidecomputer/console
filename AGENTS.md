# Principles & setup

- Keep the console a thin client over the Oxide API: minimize client-only state, surface API concepts, and bias toward simple, predictable UI that works everywhere.
- Favor well-supported libraries, avoid premature abstractions, and use routes to capture state.
- Before starting a feature, skim an existing page or form with similar behavior and mirror the conventions—this codebase is intentionally conventional. Look for similar pages in `app/pages` and forms in `app/forms` to use as templates.
- Use Node.js 22+, then install deps and start the mock-backed dev server (skip if `npm run dev` is already running in another terminal):

  ```sh
  npm install
  npm run dev
  ```

# Comment style

- Prefer comments that spell out the motivation, constraints, or quirks behind a block—avoid narrating what the code already says. Good examples call out browser limits, backend caps, or sequencing expectations so future readers know the context, not just the mechanics.

# API utilities & constants

- Treat `app/api/util.ts` (and friends) as a thin translation layer: mirror backend rules only when the UI needs them, keep the client copy minimal, and always link to the authoritative Omicron source so reviewers can verify the behavior.
- API constants live in `app/api/util.ts:25-38` with links to Omicron source: `MAX_NICS_PER_INSTANCE` (8), `INSTANCE_MAX_CPU` (64), `INSTANCE_MAX_RAM_GiB` (1536), `MIN_DISK_SIZE_GiB` (1), `MAX_DISK_SIZE_GiB` (1023), etc.
- Use `ALL_ISH` (1000) from `app/util/consts.ts` when UI needs "approximately everything" for non-paginated queries—convention is to use this constant rather than magic numbers.

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
- Gate per-resource actions with capability helpers: `instanceCan.start(instance)`, `diskCan.delete(disk)`, etc. (`app/api/util.ts:91-207`)—these return booleans and have `.states` properties listing valid states. Always use these instead of inline state checks; they centralize business logic and link to Omicron source explaining restrictions.
- Pass `disabledReason` prop (accepts ReactNode) when disabling buttons so the UI explains why the action is unavailable.


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
- Export navigation helpers via `pb` in `app/util/path-builder.ts`; every new route should get a path-builder entry and appear in `app/util/path-builder.spec.ts`'s snapshot.
- Breadcrumbs come from route `handle.crumb`; use `makeCrumb`/`titleCrumb` and provide a `path` when the parent route redirects (`app/hooks/use-crumbs.ts:21-64`). Use `titleCrumb` for side modal forms that should appear in page title but not nav breadcrumbs (check `Crumb.titleOnly` flag).
- When adding tabs or redirects, wire the canonical link in the path builder (e.g., point to the default tab) and update the sidebar/quick actions as needed.
- For tabs synced with query params, use `QueryParamTabs` component which manages `?tab=` param and removes it when default tab is selected (`app/components/QueryParamTabs.tsx`).

# Forms

- Forms live under `app/forms`; start by copying a nearby example such as `app/forms/project-create.tsx:21-61`.
- Use `react-hook-form` with the shared shells (`SideModalForm`, `ModalForm`, `FullPageForm`) so UX and submit handling stay consistent (`app/components/form/SideModalForm.tsx:32-140`).
- Wire submissions through `useApiMutation`, invalidate or seed queries with `useApiQueryClient`, and surface success with toasts/navigation (`app/forms/project-create.tsx:34-55`).
- Prefer the existing field components (`app/components/form/fields`) and only introduce new ones when the design system requires it.

# Tables & detail views

- Use shared column helpers from `app/table/columns/common.tsx`: `Columns.id` (with copy button), `Columns.description` (truncated with tooltip), `Columns.size` (formatted with units), `Columns.timeCreated`, `Columns.timeModified`.
- Compose row actions with `useColsWithActions` and the confirm-action stores; prime modals by seeding list data into the cache (e.g., `queryClient.setQueryData`) so edits open immediately (`app/pages/ProjectsPage.tsx`).
- `getActionsCol` automatically includes "Copy ID" if row has `id` field, and actions labeled "delete" get destructive styling. Pass `disabled` prop with ReactNode for tooltip explaining why action is unavailable (`app/table/columns/action-col.tsx`).
- Let `useQueryTable` drive pagination, scroll reset, and placeholder loading states instead of reimplementing TanStack Table plumbing (`app/table/QueryTable.tsx`).
- Use `PropertiesTable` compound component for detail views: `PropertiesTable.Row`, `PropertiesTable.IdRow` (truncated ID with copy), `PropertiesTable.DescriptionRow`, `PropertiesTable.DateRow` (`app/ui/lib/PropertiesTable.tsx`).

# Layout & accessibility

- Build pages inside the shared `PageContainer`/`ContentPane` so you inherit the skip link, sticky footer, pagination target, and scroll restoration tied to `#scroll-container` (`app/layouts/helpers.tsx`, `app/hooks/use-scroll-restoration.ts`).
- Surface page-level buttons and pagination via the `PageActions` and `Pagination` tunnels from `tunnel-rat`; anything rendered through `.In` components lands in the footer `.Target` automatically (`app/components/PageActions.tsx`, `app/components/Pagination.tsx`). This tunnel pattern is preferred over React portals for maintaining component co-location.
- For global loading states, reuse `PageSkeleton`—it keeps the MSW banner and grid layout stable, and `skipPaths` lets you opt-out for routes with custom layouts (`app/components/PageSkeleton.tsx`).
- Enforce accessibility at the type level: use `AriaLabel` type from `app/ui/util/aria.ts` which requires exactly one of `aria-label` or `aria-labelledby` on custom interactive components.

# Route params & loaders

- Wrap `useParams` with the provided selectors (`useProjectSelector`, `useInstanceSelector`, etc.) so required params throw during dev and produce memoized results safe for dependency arrays (`app/hooks/use-params.ts`).
- Param selectors use React Query's `hashKey` internally to ensure stable object references across renders—same values = same object identity, preventing unnecessary re-renders.
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

# Error handling

- All API errors flow through `processServerError` in `app/api/errors.ts`, which transforms raw errors into user-friendly messages with special handling for common cases (Forbidden, ObjectNotFound, ObjectAlreadyExists).
- On 401 errors, requests auto-redirect to `/login?redirect_uri=...` except for `loginLocal` endpoint which handles 401 in-page (`app/api/hooks.ts:49-57`).
- On 403 errors, the error boundary automatically checks if the user has no groups and no silo role, displaying IDP misconfiguration guidance when detected (`app/components/ErrorBoundary.tsx:42-54`).
- Throw `trigger404` (an object `{ type: 'error', statusCode: 404 }`) in loaders when resources don't exist; the error boundary will render `<NotFound />` (`app/components/ErrorBoundary.tsx`).

# Validation patterns

- Resource name validation: use `validateName` from `app/components/form/fields/NameField.tsx:44-60` (max 63 chars, lowercase letters/numbers/dashes, must start with letter, must end with letter or number). This matches backend validation.
- Description validation: use `validateDescription` for max 512 char limit (`app/components/form/fields/DescriptionField.tsx`).
- IP validation: use `validateIp` and `validateIpNet` from `app/util/ip.ts` for IPv4/IPv6 and CIDR notation—regexes match Rust `std::net` behavior for consistency.
- All validation functions return `string | undefined` for react-hook-form compatibility.

# Type utilities

- Check `types/util.d.ts` for `NoExtraKeys` (catches accidental extra properties) and other type helpers.
- Prefer `type-fest` utilities for advanced type manipulation.
- Route param types in `app/util/path-params.ts` use `Required<Sel.X>` pattern to distinguish required path params from optional query params.

# Utility functions

- Check `app/util/*` for string formatting, date handling, math, IP parsing, arrays, and file utilities. Use existing helpers before writing new ones.

# Icons & visual feedback

- Import icons from `@oxide/design-system/icons/react` with size suffixes: `16` for inline/table use, `24` for headers/buttons, `12` for tiny indicators.
- Use `StateBadge` for resource states, `EmptyMessage` for empty states, `HL` for highlighted text in messages.

# Role & permission patterns

- Role helpers in `app/api/roles.ts`: `getEffectiveRole` determines most permissive role from a list, `roleOrder` defines hierarchy (admin > collaborator > viewer).
- Use `useUserRows` hook to enrich role assignments with user/group names, sorted via `byGroupThenName` (groups first, then alphabetically).
- Use `useActorsNotInPolicy` to fetch users/groups not already in a policy (for add-user forms).
- Policy transformations: `updateRole` and `deleteRole` produce new policies immutably.
- Check `userRoleFromPolicies` to determine effective user role across multiple policies (e.g., project + silo).
