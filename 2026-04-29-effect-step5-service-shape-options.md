# Step 5 design: service shape options

Date: 2026-04-29

Companion to the image-upload survey and runtime-and-tiers notes. Step 5 of
the incremental adoption plan extracts the workflow's API surface into Effect
services (`Context.Tag` + `Layer`). The service shape is a real design choice;
this doc lays out the options.

## Inventory of operations to cover

The workflow uses 11 distinct API operations across three resources, plus
three React Query side effects.

- **Disk** — `diskCreate`, `diskView`, `diskDelete`,
  `diskBulkWriteImportStart`, `diskBulkWriteImport`,
  `diskBulkWriteImportStop`, `diskFinalizeImport`
- **Image** — `imageCreate`, `imageView` (the name-taken precheck)
- **Snapshot** — `snapshotView`, `snapshotDelete`
- **RQ** — `queryClient.fetchQuery` (used for the `view` calls and the
  precheck), `queryClient.invalidateEndpoint('imageList' | 'diskList' |
'snapshotList')`

## Main axis: how to shape the services

### Option A — Resource-shaped

One service per API resource. Each service exposes only the methods the
workflow actually uses (not the whole REST surface for that resource).

```ts
class DiskApi extends Context.Tag("DiskApi")<DiskApi, {
  create:         (body: DiskCreate) => Effect.Effect<Disk, ApiError>
  view:           (id: string) => Effect.Effect<Disk, ApiError>
  delete:         (id: string) => Effect.Effect<void, ApiError>
  bulkWriteStart: (id: string) => Effect.Effect<void, ApiError>
  bulkWriteStop:  (id: string) => Effect.Effect<void, ApiError>
  bulkWrite:      (id: string, body: BulkWriteBody) => Effect.Effect<void, ApiError>
  finalize:       (id: string, snapshotName: string) => Effect.Effect<void, ApiError>
}>() {}
class ImageApi    extends Context.Tag(...)<...>() {}
class SnapshotApi extends Context.Tag(...)<...>() {}
```

Pros: mirrors the API; reusable if another feature needs disks; clear 1:1
with `api.diskCreate` etc.; mocking individual methods is natural.

Cons: `DiskApi` has 7 methods, most only used here. Reuse benefit is
theoretical until a second workflow exists. Tests have to provide all
methods even when exercising one.

### Option B — Workflow-shaped

One service whose methods are the _steps_ of the upload, not REST endpoints.

```ts
class ImageUploadApi extends Context.Tag('ImageUploadApi')<
  ImageUploadApi,
  {
    imageNameTaken: (name: string) => Effect.Effect<boolean, ApiError>
    prepareDisk: (input: PrepareInput) => Effect.Effect<Disk, ApiError> // create + bulkWriteStart
    uploadChunk: (diskId: string, chunk: Chunk) => Effect.Effect<void, ApiError>
    finalizeDisk: (diskId: string, name: string) => Effect.Effect<Snapshot, ApiError> // stop + finalize + snapshotView
    publishImage: (input: PublishInput) => Effect.Effect<Image, ApiError>
    cleanupDisk: (id: string) => Effect.Effect<void, ApiError> // state-aware: stop + finalize + delete
    cleanupSnapshot: (id: string) => Effect.Effect<void, ApiError>
  }
>() {}
```

Pros: workflow-native shape; tests mock at the meaningful seam; the
state-aware cleanup logic at lines 322–346 lives in `cleanupDisk` instead
of the workflow; one service to provide.

Cons: bespoke; not reusable. Hides composite operations, which makes it
harder to test partial failures (e.g., "stop succeeds but finalize fails" —
both inside `finalizeDisk`). The service ends up replicating most of the
orchestration the workflow was supposed to handle.

### Option C — Thin pass-through

One service that exposes the whole generated `api` object, plus a
`QueryClient` service.

```ts
class ApiClient extends Context.Tag('ApiClient')<ApiClient, typeof api>() {}
class Cache extends Context.Tag('Cache')<
  Cache,
  {
    fetchQuery: <T>(q: QueryFn<T>) => Effect.Effect<T, ApiError>
    invalidateEndpoint: (name: keyof typeof api) => Effect.Effect<void>
  }
>() {}
```

Pros: minimum new code; total flexibility; trivial `Live` layer
(`Layer.succeed(ApiClient, api)`).

Cons: defeats most of the point. The whole value of the `R` parameter is
"this Effect needs _these specific_ capabilities." Saying "this Effect
needs the entire API" is the same as importing it. Mocks have to fake the
entire generated `api` shape (or cast `Partial<typeof api>`, which loses
the type safety we're paying for). Tests don't get clearer.

## Sub-question 1 — How does the service interact with `useApiMutation`?

**(α) Service wraps `mutation.mutateAsync`.** `LiveDiskApi` is constructed
inside the component, closing over the existing `useApiMutation` hooks.
Step icons keep working because RQ still tracks isPending/isSuccess on each
mutation.

```ts
const createDisk = useApiMutation(api.diskCreate)
// ...
const liveDiskApi = useMemo(() => Layer.succeed(DiskApi, {
  create: (body) => Effect.tryPromise({
    try: () => createDisk.mutateAsync({ body, query: { project } }),
    catch: (e) => e as ApiError,
  }),
  // ...
}), [createDisk, ...])
```

Pros: zero UI regression. Cons: layer constructed at render; can't hoist
out of the component yet.

**(β) Service calls `api.*` directly, bypassing RQ mutations.** Step icons'
isPending/isSuccess go dark for steps 5–6 and only come back at step 7
when `StepStatus` service ships.

Pros: workflow truly decoupled from React. Cons: temporary UI regression
during the learning-exercise commits.

**(γ) Hybrid.** Service calls `api.*` directly AND emits step-status
events to a callback the component supplies. Half of step 7 done at step 5.

Pros: no UI regression, no React-RQ coupling. Cons: introduces `StepStatus`
service two steps early, conflating the lessons.

## Sub-question 2 — `queryClient.fetchQuery` and invalidations

**(i) Bake into resource services.** `DiskApi.view(id)` calls
`queryClient.fetchQuery(q(api.diskView, ...))` internally. Invalidation
lives next to the mutation that motivates it.

**(ii) Separate `Cache` service.** Workflow does `yield* cache.fetchQuery(...)`
and `yield* cache.invalidate("diskList")` explicitly. Resource services
only do non-cached calls.

(i) is more ergonomic; (ii) is more explicit and makes invalidation testable
separately.

## Decision: A + β + i

Priority chosen: best final design over tests-green-throughout. Each rev
should leave every line of new code in its final shape, even if some e2e
tests fail in interim revs.

- **A** because B replicates the orchestration we want to test, and C costs
  the type-level value of `R`. Resource-shaped is the conventional Effect
  choice; the lesson is feeling how the `R` parameter constrains
  capability, and three small services make that concrete.
- **β** because α is rework dressed as a step. `useApiMutation` in this
  file isn't being used as a cache, retry mechanism, or deduplicator —
  it's being conscripted as an ad-hoc state machine whose `isPending`
  /`isSuccess`/`isError` drive Step icons. That's exactly what a fiber's
  status (or a `StepStatus` service event) tells you natively. Going α at
  step 5 means undoing it at step 7/8. β puts every line in its final
  shape immediately.
- **i** because we don't yet need invalidation to be a separately-testable
  concern. The two `onSuccess` invalidations (`diskList`, `snapshotList`)
  fold into `liveDiskApi.delete` and `liveSnapshotApi.delete` as one
  extra line each.

### Why not γ

γ (services + StepStatus together at step 5) was a tests-green compromise.
It conflates two distinct concepts in one rev: services for things Effect
_calls_ (DiskApi, ImageApi, SnapshotApi — the network) and services for
things Effect _emits to_ (StepStatus — the host's React state). With
tests-green relaxed, those concepts can be taught one at a time. The dual
"services flow data the other direction too" lesson lands more cleanly
when it stands on its own at step 7.

## Revised step ordering (5 → 8)

The original plan had StepStatus emerging implicitly with ProgressReporter
at step 7. With β at step 5, the ordering becomes:

**Step 5 — Resource services only (β)**
Define `DiskApi`, `ImageApi`, `SnapshotApi`. `Live` factories call `api.*`
directly. Delete the 8 `useApiMutation` declarations and the
`mainFlowMutations` / `cleanupMutations` / `allMutations` arrays.
`formLoading` becomes a single `running` boolean. Stub the `Step`
components' `state` props with `initSyntheticState` so the build still
compiles. AbortController-based cancellation stays — that's step 6's
lesson.

Lesson: services as the DI mechanism for things Effect calls.

E2e cost: ~6 of 13 image-upload tests fail (the ones asserting per-step
`data-status` transitions). tsc + lint + the cancel test stay green.

**Step 6 — Scopes + Fiber + acquireRelease**
Lift disk+snapshot into `Effect.acquireRelease`. Switch from
`runPromise(_, { signal })` to `runFork` returning a `Fiber`. Replace
`AbortController` with `Fiber.interrupt`. Delete `cleanup()`, the refs,
`cancelEverything`, `ABORT_ERROR`, and the boundary translation.
State-aware cleanup at lines 322–346 becomes the `release` arrow next to
the `acquire`.

Lesson: structured concurrency, scopes, finalizers. The runtime's
signature feature.

E2e cost: same step-status failures as step 5; the cancel/cleanup tests
should still pass because observable behavior is unchanged.

**Step 7 — StepStatus + ProgressReporter services**
Two services for emitting events back to React. `liveStepStatus(setStepStates)`
and `liveProgressReporter(setUploadProgress)` close over React setters.
Replace stubbed Step `state` props with `stepStates.createDisk` etc.
driven by service events.

Lesson: services as the dual — the same mechanism flows data the other
direction. Same `Context.Tag`, same `Layer.succeed`, opposite data
direction. The contrast with step 5 is the clarifying part.

E2e: tests go green again here.

**Step 8 — Lift workflow into a pure value**
Move `uploadFlow` to `app/forms/image-upload-flow.ts`. Component becomes
form + `runFork` + render UI. Add vitest tests against the workflow with
`Layer.succeed(...)` mocks.

Lesson: edge isolation; where `run*` lives in a fully Effect-shaped
program; what it means for a value to demand
`DiskApi | ImageApi | SnapshotApi | StepStatus | ProgressReporter` in its
type.

## Implementation order in the step-5 rev

1. New file `app/forms/image-upload-services.ts` defining three
   `Context.Tag`s and `liveDiskApi`, `liveImageApi`, `liveSnapshotApi`
   factories that take `(queryClient, project)` (no `useApiMutation`
   results) and return `Layer`s. The factories internally call
   `api.diskCreate({ body, query: { project } })` etc. Cleanup
   invalidations live inside `liveDiskApi.delete` /
   `liveSnapshotApi.delete`.
2. In the component, delete all 8 `useApiMutation(api.*)` calls plus
   `mainFlowMutations` / `cleanupMutations` / `allMutations` /
   `syntheticUploadState`.
3. Replace `formLoading` with a single `running` boolean managed around
   the `runPromise` boundary.
4. Stub Step `state` props with `initSyntheticState` so the build
   compiles. Will be replaced at step 7.
5. Build the merged layer via `useMemo`, thread `Effect.provide(layer)`
   into the existing `runPromise` calls. The workflow body changes to
   `yield* DiskApi` etc. instead of `await mutation.mutateAsync`.

## First vitest test once this lands

`postChunkEff` becomes
`(diskId, chunk) => Effect<void, ApiError, DiskApi>`. A test provides
`Layer.succeed(DiskApi, { bulkWrite: () => Effect.fail(new ApiError(...)), ... })`
and asserts retry count by spying on the failing method. No MSW, no
browser, runs in milliseconds.
