# Effect.ts as a learning lens for image upload

Date: 2026-04-29

## Goal

Use the image upload workflow in `app/forms/image-upload.tsx` as a teaching
example for understanding what Effect (https://effect.website) offers. The
upload flow is the most complex hand-rolled async orchestration in the console
codebase — resource acquisition, cancellation, retry, concurrency, typed errors,
and timeouts all in one file — so it surfaces most of Effect's primitives
naturally. The rest of the app is mostly React Router + React Query + forms,
where Effect would have to fight the framework.

This note is a survey + design sketch, not a port. The next step (separate
doc) will be a concrete test/learning plan.

## Read this first — Effect is a runtime, not a utility library

This note translates pain points into operators, which is useful but
incomplete. Each `Effect<A, E, R>` value is a *description* of a computation
that the Effect runtime interprets. That is where structured concurrency,
resource safety, time-as-a-service, and type-level dependencies come from —
not from any individual operator.

The "composable utilities" framing in this note covers tier 1 of incremental
adoption. The runtime model only becomes felt at tier 2 onward, when
services, `acquireRelease`, and the full workflow start living inside one
fiber tree.

For the deeper framing, the runner mechanics (`Effect.runPromise` etc. as
the entry to the runtime), the `run*` migration through the steps, and
tiered-value analysis, read
`2026-04-29-effect-runtime-and-incremental-tiers.md` alongside this note.

## Where Effect would land in the existing flow

Six specific pain points in `app/forms/image-upload.tsx`, each of which Effect
compresses into a primitive.

### 1. Resource acquisition + cleanup (lines 279–346, 322–346)

The temp disk and snapshot are tracked through `useRef`s, and `cleanup()` has
to re-fetch the disk and pattern-match on its state to figure out how far the
import got before tearing down. Plus the success path duplicates teardown
inline at lines 492–493.

Effect equivalent: `Effect.acquireRelease`. The release runs unconditionally
when the scope exits — on success, failure, OR interruption — and lives next to
the acquisition.

```ts
const tempDisk = Effect.acquireRelease(
  createDisk(...),
  (disk, exit) => Effect.gen(function* () {
    const fresh = yield* api.diskView({ disk: disk.id })
    if (fresh.state === "importing_from_bulk_writes") {
      yield* api.diskBulkWriteImportStop(...)
      yield* api.diskFinalizeImport(...)
    }
    yield* api.diskDelete({ disk: disk.id })
  })
)
```

Refs go away. The whole `cleanup()` function and the success-path teardown
collapse into one definition.

### 2. Sequenced pipeline with cancellation (the entire `onSubmit`, lines 348–496)

Every step is followed by `abortController.current?.signal.throwIfAborted()`
(six explicit calls). In Effect, interruption is automatic — when the parent
fiber is interrupted, every `yield*` is a cancellation point and unwinding runs
the registered finalizers. The body becomes a flat `Effect.gen` with no
`throwIfAborted` calls and no `try/finally` for cleanup.

### 3. Concurrency-limited retry (lines 405–444)

```ts
// today
await pMap(
  genChunks(),
  (i) => pRetry(() => postChunk(i), { retries: 2 }),
  { concurrency: 6, signal: abortController.current?.signal }
)
```

```ts
// effect
Effect.forEach(
  Array.range(0, nChunks),
  (i) => postChunk(i).pipe(Effect.retry(Schedule.recurs(2))),
  { concurrency: 6 }
)
```

The retry policy is a value (`Schedule`), so adding exponential backoff is just
`Schedule.recurs(2).pipe(Schedule.intersect(Schedule.exponential("100 millis")))`
without changing call sites. Cancellation propagates through `forEach`
automatically.

### 4. Per-request timeout + global cancel (lines 418–421)

```ts
// today
__signal: anySignal([AbortSignal.timeout(30000), abortController.current?.signal])
```

```ts
// effect
postChunk(i).pipe(Effect.timeout("30 seconds"))
```

The whole `app/util/abort.ts` polyfill becomes unnecessary. Effect treats
timeout and interruption as the same notion, so they compose without manual
signal merging.

### 5. Cancel-vs-fail discrimination (lines 147, 445–449, 552–558)

The `ABORT_ERROR` sentinel and `if (e !== ABORT_ERROR)` checks exist because
`try/catch` flattens cancellation and failure into one channel. Effect splits
them at the type level via `Exit` / `Cause`:

```ts
const exit = yield* Effect.exit(uploadFlow)
Exit.match(exit, {
  onFailure: (cause) => Cause.isInterruptedOnly(cause)
    ? noop
    : setModalError("Something went wrong."),
  onSuccess: () => setAllDone(true),
})
```

### 6. 404-as-typed-error precheck (lines 518–535)

```ts
// today
.catch((e) => {
  if (e.statusCode === 404) return null
  throw e
})
```

`errorsExpected` only suppresses the console warning; the caller still gets a
thrown error. With a tagged error union, the precheck becomes
`Effect.catchTag("NotFound", () => Effect.succeed(null))` and any unhandled
`ApiError` stays in the error channel.

### Larger reading

The comment at line 191 ("The state in this component is very complex…") is
really saying "I'm using React state and AbortControllers to model a workflow
with steps, finalizers, and interruption." Those are the things `Effect` +
`Scope` + `Fiber` are.

## React integration

Effects are values until you run them, so the boundary lives wherever you'd
otherwise call `await`. Build the workflow as a value, run it inside the
`mutationFn` of `useApiMutation` or in an event handler:

```ts
const fiber = Effect.runFork(uploadFlow)
// later, instead of abortController.abort():
Effect.runPromise(Fiber.interrupt(fiber))
```

`runFork` returns a `Fiber` whose `interrupt` replaces the AbortController.
`runPromise` returns a Promise you can hand to RQ.

What stays the same:
- React state still drives the UI (Step icons, progress bar, modal state).
- React Query stays the cache layer.
- The `Step` component and the upload modal are unchanged.

What goes away:
- `useRef<AbortController>`, `cancelEverything()`, `cleanup()`, `resetMainFlow()`.
- The `mainFlowMutations` / `cleanupMutations` arrays.
- Probably the `syntheticUploadState` (line 224) — see "ProgressReporter"
  pattern below.

There are bindings like `@effect-rx/rx-react` for managing Effect state across
components, but they'd be overkill for one feature.

## Bundle size — honest

Full `effect@3.21.2` package: ~955 KB minified, ~291 KB gzipped at the barrel.
Submodule imports (`effect/Effect`, `effect/Schedule`, `effect/Scope`,
`effect/Cause`, `effect/Exit`, `effect/Fiber`) tree-shake well — realistic
footprint for the upload workflow is in the tens of KB gzipped, not 291. Still
much more than the ~3 KB combined for `p-retry` + `p-map` + `app/util/abort.ts`.

For one workflow, it's overkill. Where it pays off is when the second feature
arrives — second use is nearly free, and the pattern propagates.

Pragmatic stance for this codebase: treat Effect as a learning lens. Don't
land it for production unless a second feature with similar shape shows up
(long-running migration UI, multi-step system update flow, etc.).

A separate but important point: the bundle cost is incurred at step 0 of
incremental adoption (when `effect` becomes a dep). It does not scale with
how much of Effect you use. So if you stop at tier 1 (steps 1–4), you have
paid the full bundle cost for a fraction of the value. The cost/benefit gets
better at each higher tier — which is itself an argument for committing to
tier 2 or 3 if you adopt at all. See the runtime/tiers companion note for
what each tier buys.

## Testability — the strongest argument

Effects carry their dependencies in the third type parameter
(`Effect<A, E, R>`). The workflow is a pure value that demands services from
context; you can't run it until you provide a `Layer` for every service. This
makes the orchestration unit-testable in pure Node with vitest.

### Service pattern

```ts
class DiskApi extends Context.Tag("DiskApi")<DiskApi, {
  readonly create: (body: DiskCreate) => Effect.Effect<Disk, ApiError>
  readonly view:   (id: string)       => Effect.Effect<Disk, ApiError>
  readonly bulkWriteStart: (id: string) => Effect.Effect<void, ApiError>
  // ...
}>() {}

const uploadFlow = (input: FormValues) => Effect.gen(function* () {
  const disks = yield* DiskApi
  const disk = yield* disks.create({ name: tmpName(input.imageName), ... })
  // ...
})
//   ^? Effect<void, ApiError | UploadError, DiskApi | ImageApi | SnapshotApi>
```

### Production wiring

```ts
const LiveDiskApi = Layer.succeed(DiskApi, {
  create: (body) => Effect.tryPromise({
    try: () => api.diskCreate({ body, query: { project } }),
    catch: (e) => e as ApiError,
  }),
  // ...
})

// in the component
const fiber = uploadFlow(values).pipe(
  Effect.provide(Layer.mergeAll(LiveDiskApi, LiveImageApi, LiveSnapshotApi)),
  Effect.runFork,
)
```

### Test wiring

```ts
const FakeDiskApi = (overrides: Partial<DiskApi> = {}) => Layer.succeed(DiskApi, {
  create: () => Effect.succeed({ id: "d-1", state: { state: "import_ready" }, ... }),
  delete: vi.fn(() => Effect.void),
  ...overrides,
})

test("if chunk upload fails after retries, disk is finalized and deleted", async () => {
  const deleteSpy = vi.fn(() => Effect.void)
  const exit = await Effect.runPromiseExit(
    uploadFlow(fixture).pipe(Effect.provide(Layer.mergeAll(
      FakeDiskApi({ delete: deleteSpy }),
      FakeImageApi(),
      FakeSnapshotApi({ chunkUpload: () => Effect.fail(new ChunkError()) }),
    )))
  )
  expect(Exit.isFailure(exit)).toBe(true)
  expect(deleteSpy).toHaveBeenCalledOnce()
})

test("interrupt mid-upload runs the disk + snapshot finalizers", async () => {
  const fiber = Effect.runFork(uploadFlow(fixture).pipe(Effect.provide(Slow)))
  await sleep(50)
  await Effect.runPromise(Fiber.interrupt(fiber))
  // assert teardown calls happened in the right order
})
```

### TestClock for retry/timeout assertions without real time

```ts
test("retries chunk twice then gives up", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(uploadFlow(fixture))
    yield* TestClock.adjust("90 seconds")
    const exit = yield* Fiber.await(fiber)
    expect(callCount).toBe(3)  // 1 + 2 retries
  }).pipe(Effect.provide(...), Effect.runPromise))
```

### What this unlocks vs. today

The upload flow currently has no unit tests. It's exercised by
`test/e2e/image-upload.e2e.ts` with MSW sentinels (`disk-create-500`,
`import-start-500`, `import-stop-500`, `disk-finalize-500`) driving a real
browser. Appropriate for UI integration, heavy for "does cleanup run when
chunk 47 fails after the second retry, given the disk reached
`importing_from_bulk_writes` but not `import_ready`?" That's exactly the class
of question the comment block at lines 156–180 gestures at.

With the workflow extracted, keep one or two e2e tests for the UI shell (modal
opens, progress bar moves, cancel button works) and move the orchestration
matrix — every combination of step-N-failed × disk-state-at-failure ×
cancel-vs-error — into fast vitest cases.

### Things that stay in the component

- Progress percentage reporting back to React state.
- Cancel-confirmation modal.

Clean approach: thread a `ProgressReporter` service into the workflow that the
component supplies as `Layer.succeed(ProgressReporter, { report: setUploadProgress })`.
Workflow stays pure; component owns React state and provides a callback-shaped
layer. Same pattern for emitting per-step status — would let us delete the
`syntheticUploadState` hack at line 224.

## Open questions for the test/learning plan

- Scope: port the whole `onSubmit` or just the chunked upload loop?
  - Whole `onSubmit` exercises acquireRelease + Layer + Cause/Exit.
  - Just the loop exercises forEach + Schedule + timeout — smaller, faster
    feedback, less framework integration.
- Where does the ported code live? Probably `app/forms/image-upload-effect.ts`
  alongside the existing form, with a dev-only feature flag to switch.
  Or just a parallel scratch file under `.claude/notes/scratch/` since this
  is a learning exercise, not a real port.
- Which services? At minimum `DiskApi`, `ImageApi`, `SnapshotApi`,
  `ProgressReporter`. Do we model `queryClient` invalidation as a service too?
- How do we want to learn — read-then-write, or red/green from a test fixture?
- Do we keep `useApiMutation` at all, or run the workflow standalone and
  invalidate via a `QueryClient` service?
