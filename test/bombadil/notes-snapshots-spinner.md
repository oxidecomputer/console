# 2026-04-23 — Snapshots-page "stuck spinner" is a spec false positive

Round 2b, slot 8 (`form-pinned` on `/projects/mock-project/vpcs/mock-vpc/firewall-rules-new`)
produced 5 `loadingResolves` violations, all sharing one antecedent timestamp.
The trace (`test/bombadil/repros/snapshots-spinner-stuck/trace.jsonl`) shows a
spinner visible continuously on `/projects/mock-project/snapshots` for ~10s
across 18 interactions, then on `/projects/mock-project/instances` for another
~4s, while every API call returned HTTP 200.

Investigation: not an app bug. The `hasSpinner` extractor in the bombadil spec
is too broad.

## What `hasSpinner` matches

`test/bombadil/spec-shared.ts:40`:

```ts
const hasSpinner = extract(
  (state) => state.document.querySelector('[aria-label="Spinner"]') !== null
)
```

Every `<Spinner>` instance in the app sets `aria-label="Spinner"`
(`app/ui/lib/Spinner.tsx:73`), regardless of purpose. So the extractor fires
for _any_ spinner anywhere on the page.

## Three distinct uses of `<Spinner>` in the app

Only the third one corresponds to "page is loading":

1. **State-badge transition indicators** (`app/components/StateBadge.tsx:40,66,82`).
   `InstanceStateBadge`, `DiskStateBadge`, `SnapshotStateBadge` render a
   `<Spinner size="sm">` whenever the resource itself is in a transitioning
   state (instance `starting`/`rebooting`/`migrating`/…, disk
   `attaching`/…, snapshot `creating`). These represent _backend_ state. In
   the mock API they live forever because nothing transitions them.
2. **`InstanceAutoRestartPopover`** "Restarting soon…" indicator
   (`app/components/InstanceAutoRestartPopover.tsx:83`). Also backend state,
   not UI loading.
3. **Real UI-loading spinners.** `Pagination` (`app/ui/lib/Pagination.tsx:64`,
   driven by `isPlaceholderData` in `QueryTable.tsx:115`) and `SpinnerLoader`
   wrappers on `RefreshButton` / `RefetchIntervalPicker`. These should
   resolve within seconds.

## Why it manifested on those exact URLs

Each affected URL had at least one category-(1) spinner guaranteed to be
present by the seed data:

- `/mock-project/snapshots` — 160 generated snapshots with `randomSnapshotState()`
  (`mock-api/snapshot.ts:23`) put ~3–5% in `creating` state. The table's
  state column renders permanent `<Spinner>` elements for those rows.
- `/mock-project/instances` — one seed instance has `run_state: 'starting'`
  (`mock-api/instance.ts:61`). `instanceTransitioning('starting')` is true,
  so its badge shows a permanent spinner.
- `/utilization` — `RefetchIntervalPicker` / `RefreshButton` use
  `SpinnerLoader` with a 500ms `minTime`, which re-triggers on every
  auto-refetch. Real loading, just ambient.

## Why it looked like one spinner persisting across a page transition

It didn't. The `~4s` of continued spinner after bombadil navigated from
`/snapshots` to `/instances` is a different spinner on the new page
(creating-snapshot badge → starting-instance badge). `loadingResolves` only
checks presence, not identity, so a back-to-back run of "there is _some_
spinner" reads as a single violation antecedent even though the specific
DOM node changed.

## Fix options for the spec

All change `spec-shared.ts`, not app code:

- **(a) Scope the selector to exclude small spinners.** State-badge spinners
  are all `size="sm"` (`StateBadge.tsx:40,66,82`) and get a `.spinner-sm`
  class. Real loading spinners are larger. Selector:
  `[aria-label="Spinner"]:not(.spinner-sm)`. Smallest diff; matches existing
  classnames the Spinner component already emits.
- **(b) Give loading spinners a distinct aria-label.** Change `<Spinner>`
  to accept an `aria-label` override and have `SpinnerLoader` / `Pagination`
  pass `"Loading"`. Then the extractor matches only `[aria-label="Loading"]`.
  Bigger surface area but semantically cleaner.
- **(c) Drop `loadingResolves`.** The property assumes a spinner implies
  loading, which doesn't hold in this app. Losing it means losing a genuine
  check against stuck `Pagination` / `SpinnerLoader` cases.

Recommendation: (a). One-line selector change, catches the same real
stuck-loader cases, and removes the state-badge noise.

## Evidence summary

- Trace: `test/bombadil/repros/snapshots-spinner-stuck/trace.jsonl` (271
  entries).
- All HTTP responses during the spinner window were 200; no error boundary
  or console errors.
- `mainText` snapshot shows the page content fully rendered
  ("Snapshots New snapshot … snapshot-1 … ready …"), confirming nothing
  was actually loading.
- The 5 `loadingResolves` violations all share one antecedent timestamp,
  consistent with the extractor firing on long-lived state-badge DOM nodes
  rather than a real stalled fetch.
