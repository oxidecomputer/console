# Effect.ts image upload exercise — wrap-up

Date: 2026-04-29

Companion to `2026-04-29-effect-image-upload-survey.md` (the operator-by-operator
plan) and `2026-04-29-effect-runtime-and-incremental-tiers.md` (what each tier
buys). This note records what each step actually shipped and assesses whether
the final result has a case as real code, not just an illustration.

## What each step shipped

Each row is a self-contained jj rev. LOC deltas are from `jj diff -r <id> --stat`.

| Step | Rev      | LOC       | Substance                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | okzxqwrm | +50/-1    | Add `effect@^3.21.2` dep. No code change.                                                                                                                                                                                                                                                                                                                                                                                        |
| 1    | onstooqw | +19/-14   | Wrap `postChunk`'s `mutateAsync` in `Effect.tryPromise` and run with `Effect.runPromise`. `runPromise` lives inside the chunk loop — Effect is a fancy promise wrapper at this point.                                                                                                                                                                                                                                            |
| 2    | rlznquzs | +5/-53    | Replace `pRetry(..., { retries: 2 })` with `Effect.retry(Schedule.recurs(2))`. Removed `p-retry` dep.                                                                                                                                                                                                                                                                                                                            |
| 3    | nxokrpox | +25/-39   | Replace `pMap(..., { concurrency: 6, signal })` with `Effect.forEach(..., { concurrency: 6 })`. `runPromise` climbed out of the chunk loop and now wraps the whole loop. Removed `p-map` dep.                                                                                                                                                                                                                                    |
| 4    | pwxynqlr | +2/-7     | Replace `__signal: anySignal([AbortSignal.timeout(30_000), abortSignal])` with `Effect.timeout('30 seconds')`. The `app/util/abort.ts` polyfill (37 LOC) is no longer used by anyone.                                                                                                                                                                                                                                            |
| 5    | typtwpwt | +299/-221 | Extract `DiskApi`, `ImageApi`, `SnapshotApi` as `Context.Tag` services in a new `image-upload-services.ts`; wire `liveDiskApi` etc. as `Layer.succeed`. Workflow body becomes `Effect<…, ApiError, DiskApi \| ImageApi \| SnapshotApi>`. (Step 5 had a prior design rev `ltyrvrpn` weighing service shapes.)                                                                                                                     |
| 6    | noyyotov | +164/-241 | Wrap the workflow in `Effect.scoped`. Lift temp disk and snapshot into `Effect.acquireRelease` with state-aware shutdown. Switch entry point from `runPromise` to `runFork` + `Fiber.await` + `Exit` pattern matching. Cancel button calls `Effect.runFork(Fiber.interrupt(fiber))`. The `ABORT_ERROR` sentinel, the six explicit `throwIfAborted()` calls, the `cleanup()` function, and the `Disk` / `Snapshot` refs are gone. |
| 7    | suoxvttp | +147/-62  | Add `StepStatus` and `ProgressReporter` services with React-`Dispatch`-shaped live layers; replace inline `setUploadProgress(...)` and `initSyntheticState` with `withStatus(name, eff)` wrappers and `progress.set(...)` calls. Step icons are driven by status emitted from inside the workflow.                                                                                                                               |
| 8    | uosyvntu | +79/-49   | Add `imageApi.nameExists(name)` (catches 404 → `false` via `Effect.catchIf`). Add `ImageNameTaken extends Data.TaggedError(...)`. Fold the precheck and the modal-open side effect into a single `submitProgram` so one `runFork` covers precheck + upload. The form's outer `onSubmit` collapses from a 30-line precheck-then-onSubmit wrapper to `onSubmit={onSubmit}`.                                                        |

The mapping to the plan was clean. Step 5 was the one place where the plan
under-specified — picking the service shape needed a side note (`ltyrvrpn`)
weighing one-tag-per-resource vs. one-tag-with-all-methods etc. before the
code rev landed. Otherwise each step ran roughly as described.

## Final state vs original

Original: `app/forms/image-upload.tsx`, 824 LOC, single file.
Final: `app/forms/image-upload.tsx` (707 LOC) + `app/forms/image-upload-services.ts` (231 LOC) = 938 LOC across two files.

Both totals include the `BlockSizeNotice` / `BootableNotice` / `validateImage`
helpers (~135 LOC) that are unchanged by the exercise. The actual workflow
component is comparable in size; the +114 LOC delta is mostly the services
file with its tagged services, layers, and helpers — overhead that scales
sublinearly if more flows adopt the pattern, but is non-zero for this one
flow.

What's structurally different in the final code:

- **No mutation hooks.** Original had 12 `useApiMutation` calls (`createDisk`,
  `startImport`, `uploadChunk`, `stopImport`, `finalizeDisk`, `createImage`,
  `deleteDisk`, `deleteSnapshot`, plus a parallel cleanup set of 4) wired
  into `mainFlowMutations` / `cleanupMutations` arrays purely so per-step
  `isPending` / `isSuccess` / `isError` flags could drive the modal step
  icons. Final has zero — step status is emitted explicitly via the
  `StepStatus` service. The mutation cache is no longer being abused as
  workflow state.
- **No cleanup duplication.** Original had a `cleanup()` function that
  re-fetched the disk and branched on its state (`importing_from_bulk_writes`
  → stop+finalize+delete; `import_ready` → finalize+delete; otherwise just
  delete). The success path duplicated the same teardown inline at the end
  of `onSubmit`. Final puts the state-aware shutdown next to the `acquire`
  in `Effect.acquireRelease`, runs unconditionally on success/failure/
  interrupt, and has no duplication. The pre-existing `// TODO: make sure
cleanup, cancelEverything, and resetMainFlow are called in the right
places` is structurally satisfied — it's not possible to forget.
- **No abort plumbing.** Original threaded an `AbortController` through a
  `useRef`, called `abortController.current?.signal.throwIfAborted()` after
  every step (six explicit calls), used an `ABORT_ERROR` sentinel to
  distinguish user-cancel from real failure in `try/catch`, and combined
  per-request timeouts with the cancel signal via the `anySignal()` helper
  (37 LOC, no other callers). Final has none of that. `Fiber.interrupt`
  walks the scope, runs finalizers in reverse acquisition order, and aborts
  in-flight `fetch`es via the signal forwarded by `Effect.tryPromise`. The
  cancel-vs-failure split lives at the type level in `Cause` / `Exit`.
- **No resource-tracking refs.** Original kept `useRef<Disk>` and
  `useRef<Snapshot>` updated by hand so `cleanup()` knew what to tear down.
  Final has bound names inside the `Effect.gen` scope; the finalizer closes
  over them.
- **Single fiber per submit.** Original ran the precheck via
  `queryClient.fetchQuery(...).catch(...)` in the form's outer `onSubmit`,
  then awaited a separate inner `onSubmit`. Final runs both as one
  `runFork` covering precheck + upload + finalizers, with one `Exit` that
  the component pattern-matches on to dispatch form-level vs modal-level
  errors.
- **Per-request retry/timeout/concurrency are values.** Original hard-coded
  `pRetry(..., { retries: 2 })` and `AbortSignal.timeout(30000)`. Final
  uses `Schedule.recurs(2)` and `'30 seconds'` — both first-class values
  that can be composed with exponential backoff or jitter without changing
  call sites. Not exercised here but trivially available.
- **Removed deps.** `p-retry`, `p-map`, and the local `app/util/abort.ts`
  polyfill all become deletable. (Polyfill is still in the tree as of @—
  the exercise didn't delete it.)

## Bundle cost — measured at the tier we ended at

`effect@3.21.2` is ~291 KB gzipped at the barrel. We import six submodules
(`Cause`, `Effect`, `Exit`, `Fiber`, `Layer`, `Option`, `Schedule`) plus
`Context`, `Data`, and the runner internals from the services file —
they tree-shake well, realistic incremental footprint is in the tens of KB
gzipped. Compared to the ~3 KB combined for the removed `p-retry`/`p-map`/
`anySignal` polyfill, this is roughly a 10× cost increase for one feature.

The cost is paid in step 0; subsequent steps don't move it. If any other
feature adopts Effect, the second use is nearly free.

## Case as real code

**For:**

- Resource safety is now a type-level guarantee. The category of bug the
  original `cleanup()` function existed to mitigate (forgot to call it on
  some path; called it twice; called it but the `disk` ref was already
  cleared) is structurally absent. This is the single biggest win.
- Cancellation is no longer best-effort. The original's `throwIfAborted()`
  pattern only catches cancellations _between_ awaited steps; an in-flight
  `fetch` mid-chunk-upload couldn't be interrupted without the signal
  threaded through. Final has uniform interrupt propagation through every
  `yield*`, including in-flight fetches.
- The workflow is now unit-testable in vitest with fake `Layer`s. Today
  it's covered only by `test/e2e/image-upload.e2e.ts` driving a real
  browser through MSW sentinels — appropriate for the modal shell, heavy
  for orchestration questions like "does cleanup run when chunk 47 fails
  after the second retry, given the disk reached `importing_from_bulk_writes`
  but not `import_ready`?" The plan to extract those into fast vitest
  cases is now real, not hypothetical.
- The component shrank in clear ways: 12 mutation hooks → 0; two refs → 0;
  `cleanup()` + `cancelEverything()` + `resetMainFlow()` reduced to just
  `resetMainFlow()`; outer-`onSubmit` precheck wrapper collapsed to a
  one-liner. The remaining 707 LOC is mostly form scaffolding and the
  helper functions for image validation, both unchanged.
- Per-step status and progress are decoupled from the data layer (no
  more synthetic mutation state). They're proper observables that the
  component supplies via callback-shaped `Layer`s.

**Against:**

- Adopting Effect for one feature in a codebase that otherwise uses RQ +
  react-hook-form is a maintenance liability. The next maintainer of
  `image-upload.tsx` has to learn `Effect.gen`, `Layer`, `Context.Tag`,
  `acquireRelease`, `Fiber`, `Cause`, `Exit` — concepts that don't transfer
  to anything else in the repo. p-retry + AbortController are simpler to
  pick up cold.
- ~tens of KB gzipped for one feature is hard to justify on its own.
- Two files instead of one. The services file is genuine new surface
  area (231 LOC) — the wins above don't come for free, they come at a
  cost of "more concepts to keep in mind."
- Effect competes with React Query for the data-layer role. Today the
  services papers over it with ad-hoc `queryClient.invalidateEndpoint`
  and `queryClient.fetchQuery` calls inside live layers. That layering
  question doesn't have a clean answer — going further with Effect would
  push toward owning the cache, which is not on the table.
- Step 8's tagged-error pattern (`Data.TaggedError` + `instanceof` narrow
  on `Cause.failureOption`) is more ceremony than the original
  `if (image) { setFormError(...); return }`. In a fully-Effect codebase
  the ergonomics get better (`Effect.catchTag`, `Match.value` on cause);
  here it's borderline.
- `ApiError` is a plain object, not a tagged type, so we used `catchIf`
  on `statusCode` instead of `catchTag('NotFound', …)`. The "404 as typed
  error" win the survey advertised is half-realized; getting the rest
  would mean tagging `ApiError` at the generated-client level, which is a
  cross-cutting change far outside this exercise.

**Verdict.** The image upload workflow specifically is a great fit for
Effect — it's the most complex hand-rolled async orchestration in the
repo, and almost every Effect primitive earns its keep here. If this
codebase already used Effect, this design would be defensible without
question.

But it doesn't, and one feature isn't enough to justify the bundle cost
or the cognitive overhead for future maintainers. The pragmatic stance
matches what the survey predicted: keep the exercise in branch form as
documentation of what it would look like, don't merge it. If a _second_
feature with similar shape arrives (long-running migration UI; multi-step
system update flow; anything with steps, finalizers, retries, cancellation),
revisit — at that point the per-feature overhead halves and the case
becomes much stronger.

If we did adopt incrementally, **step 6 is the natural cutoff**: it
delivers the load-bearing wins (`acquireRelease`, structured cancellation,
`Fiber.interrupt`, no abort sentinel, no resource refs) for ~75% of the
total churn. Steps 7–8 are real improvements but their marginal value over
step 6 is smaller than their marginal complexity in an otherwise-non-Effect
codebase. Worth knowing where the knee of the curve is for next time.

## Things left undone

- `app/util/abort.ts` is deletable (no remaining callers) but the exercise
  didn't remove it. If this branch ever lands, that 37-LOC polyfill goes
  with it.
- No vitest tests for the workflow were written. Step 5 made them possible;
  steps 6–8 made them straightforward; the exercise stopped at "running
  e2e green" instead of demonstrating the testability win concretely.
  Writing 2–3 vitest cases (chunk-fail-after-retries, interrupt-mid-upload,
  precheck-name-taken) would be the natural next thing to settle whether
  the testability story is as good as advertised.
- `ApiError` remains untagged. Promoting it to a `Data.TaggedError` union
  at the generated-client layer is what the "404 as typed error" survey
  point actually asks for, but it's a much bigger change than this
  exercise.
