# Principles & setup

- Keep the console a thin client over the Oxide API: minimize client-only state, surface API concepts, and bias toward simple, predictable UI that works everywhere.
- Favor well-supported libraries, avoid premature abstractions, and use routes to capture state.
- Before starting a feature, skim an existing page or form with similar behavior and mirror the conventions—this codebase is intentionally conventional. Look for similar pages in `app/pages` and forms in `app/forms` to use as templates.
- `@oxide/api` is at `app/api` and `@oxide/api-mocks` is at `mock-api/index.ts`.
- Use Node.js 22+, then install deps and start the mock-backed dev server (skip if `npm run dev` is already running in another terminal):

  ```sh
  npm install
  npm run dev
  ```

# Comment style

- Comment the _why_, not the _what_. If a line's purpose isn't obvious from context, give a short reason (e.g., `// clear API error state`)

# API utilities & constants

- Treat `app/api/util.ts` (and friends) as a thin translation layer: mirror backend rules only when the UI needs them, keep the client copy minimal, and always link to the authoritative Omicron source so reviewers can verify the behavior. Only keep 7 chars of the commit hash in the URL.
- API constants live in `app/api/util.ts` with links to Omicron source.

# Testing code

- Run local checks before sending PRs: `npm run lint`, `npm run tsc`, `npm test run`, and `npm run e2ec`.
- You don't usually need to run all the e2e tests, so try to filter by file and tes t name like `npm run e2ec -- instance -g 'boot disk'`. CI will run the full set.
- Keep Playwright specs focused on user-visible behavior—use accessible locators (`getByRole`, `getByLabel`), the helpers in `test/e2e/utils.ts` (`expectToast`, `expectRowVisible`, `selectOption`, `clickRowAction`), and close toasts so follow-on assertions aren’t blocked.
- Cover role-gated flows by logging in with `getPageAsUser`; exercise negative paths (e.g., forbidden actions) alongside happy paths as shown in `test/e2e/system-update.e2e.ts`.
- Consider `expectVisible` and `expectNotVisible` deprecated: prefer `expect().toBeVisible()` and `toBeHidden()` in new code.
- When UI needs new mock behavior, extend the MSW handlers/db minimally so E2E tests stay deterministic; prefer storing full API responses so subsequent calls see the updated state (`mock-api/msw/db.ts`, `mock-api/msw/handlers.ts`).
- Co-locate Vitest specs next to the code they cover; use Testing Library utilities (`render`, `renderHook`, `fireEvent`, fake timers) to assert observable output rather than implementation details (`app/ui/lib/FileInput.spec.tsx`, `app/hooks/use-pagination.spec.ts`).
- For sweeping styling changes, coordinate with the visual regression harness and follow `test/visual/README.md` for the workflow.

# Data fetching pattern

- Data from `usePrefetchedQuery` is guaranteed to be defined (the loader ensures it and the hook throws if it's not present). Do not add `if (!data) return` guards on these values.
- Define queries with `q(api.endpoint, params)` for single items or `getListQFn(api.listEndpoint, params)` for lists. Prefetch in `clientLoader` and read with `usePrefetchedQuery`; for on-demand fetches (modals, secondary data), use `useQuery` directly.
- Use `ALL_ISH` from `app/util/consts.ts` when UI needs "all" items. Use `queryClient.invalidateEndpoint` to invalidate queries.
- For paginated tables, compose `getListQFn` with `useQueryTable`; the helper wraps `limit`/`pageToken` handling and keeps placeholder data stable (`app/api/hooks.ts:123-188`, `app/pages/ProjectsPage.tsx:40-132`).
- When a loader needs dependent data, fetch the primary list with `queryClient.fetchQuery`, prefetch its per-item queries, and only await a bounded batch so render isn't blocked (see `app/pages/project/affinity/AffinityPage.tsx`).

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
- Let form state mirror the form's UI structure, not the API request shape. Transform to the API shape in the `onSubmit` handler. This keeps fields, validation, and conditional logic straightforward.
- Use react-hook-form's `watch` and conditional rendering to keep fields in sync. Avoid `useEffect` to propagate form values between fields—it causes extra renders and subtle ordering bugs. Reset related fields in change handlers instead.
- In general, use `useEffect` as a last resort! Try to figure out a non-useEffect version first. See https://react.dev/learn/you-might-not-need-an-effect.md when thinking about difficult cases.

# Tables & detail views

- Use shared column helpers from `app/table/columns/common.tsx`: `Columns.id` (with copy button), `Columns.description` (truncated with tooltip), `Columns.size` (formatted with units), `Columns.timeCreated`, `Columns.timeModified`.
- Compose row actions with `useColsWithActions` and the confirm-action stores; prime modals by seeding list data into the cache (e.g., `queryClient.setQueryData`) so edits open immediately (`app/pages/ProjectsPage.tsx`).
- `getActionsCol` automatically includes "Copy ID" if row has `id` field, and actions labeled "delete" get destructive styling. Pass `disabled` prop with ReactNode for tooltip explaining why action is unavailable (`app/table/columns/action-col.tsx`).
- Let `useQueryTable` drive pagination, scroll reset, and placeholder loading states instead of reimplementing TanStack Table plumbing (`app/table/QueryTable.tsx`).
- Use `PropertiesTable` compound component for detail views: `PropertiesTable.Row`, `PropertiesTable.IdRow` (truncated ID with copy), `PropertiesTable.DescriptionRow`, `PropertiesTable.DateRow` (`app/ui/lib/PropertiesTable.tsx`).

# Layout & accessibility

- Build pages inside the shared `PageContainer`/`ContentPane` so you inherit the skip link, sticky footer, pagination target, and scroll restoration tied to `#scroll-container` (`app/layouts/helpers.tsx`, `app/hooks/use-scroll-restoration.ts`).
- Surface page-level buttons and pagination via the `PageActions` and `Pagination` tunnels from `tunnel-rat`; anything rendered through `.In` lands in `.Target` automatically.
- For global loading states, reuse `PageSkeleton`—it keeps the MSW banner and grid layout stable, and `skipPaths` lets you opt-out for routes with custom layouts (`app/components/PageSkeleton.tsx`).
- Enforce accessibility at the type level: use `AriaLabel` type from `app/ui/util/aria.ts` which requires exactly one of `aria-label` or `aria-labelledby` on custom interactive components.

# Route params & loaders

- Wrap `useParams` with the provided selectors (`useProjectSelector`, `useInstanceSelector`, etc.) so required params throw during dev and produce memoized results safe for dependency arrays (`app/hooks/use-params.ts`).
- Prefer `queryClient.fetchQuery` inside `clientLoader` blocks when the page needs data up front, and throw `trigger404` on real misses so the error boundary renders Not Found.

# Global stores & modals

- Use the zustand-powered confirm helpers (`confirmDelete`, `confirmAction`) for destructive flows—pass `mutateAsync` lambdas so failures can emit toasts automatically (`app/stores/confirm-delete.tsx`, `app/stores/confirm-action.ts`).
- Toasts live in the global store: call `addToast` with a string, node, or config and let `ToastStack` handle animation and dismissal (`app/stores/toast.ts`, `app/components/ToastStack.tsx`).

# UI components & styling

- Reach for primitives in `app/ui` before inventing page-specific widgets; that directory holds router-agnostic building blocks.
- When you just need Tailwind classes on a DOM element, use the `classed` helper instead of creating one-off wrappers (`app/util/classed.ts`).
- Reuse utility components for consistent formatting—`TimeAgo`, `EmptyMessage`, `CardBlock`, `DocsPopover`, `PropertiesTable`, etc.
- Import icons from `@oxide/design-system/icons/react` with size suffixes: `16` for inline/table, `24` for headers/buttons, `12` for tiny indicators.
- Keep help URLs in `links`/`docLinks` (`app/util/links.ts`).

# Error handling

- All API errors flow through `processServerError` in `app/api/errors.ts`, which transforms raw errors into user-friendly messages.
- On 401 errors, requests auto-redirect to `/login`. On 403, the error boundary checks for IDP misconfiguration.
- Throw `trigger404` in loaders when resources don't exist; the error boundary will render Not Found.

# Utilities & helpers

- Check `app/util/*` for string formatting, date handling, IP parsing, etc. Check `types/util.d.ts` for type helpers.
- Use `validateName` for resource names, `validateDescription` for descriptions, `validateIp`/`validateIpNet` for IPs.
- Role helpers live in `app/api/roles.ts`.
- Use ts-pattern exhaustive match when doing conditional logic on union types to make sure all arms are handled
- Avoid type casts (`as`) where possible; prefer type-safe alternatives like `satisfies`, `.returnType<T>()` for ts-pattern, or `as const`
- Use `remeda` (imported as `R`) for sorting and data transformations—e.g., `R.sortBy(items, (x) => x.key1, (x) => x.key2)` instead of manual `.sort()` comparators.
- Prefer small composable predicates (e.g., `poolHasIpVersion(versions)`) that chain with `.filter()` over monolithic filter functions with multiple optional parameters.
