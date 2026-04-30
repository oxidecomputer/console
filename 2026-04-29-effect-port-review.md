# Image-upload Effect port — code review

Date: 2026-04-29

Review of the end state of the Effect port at `app/forms/image-upload-workflow.ts`,
`app/forms/image-upload-workflow.spec.ts`, and the slimmed-down
`app/forms/image-upload.tsx`. Compared against the pre-port version of
`app/forms/image-upload.tsx` at `trunk()`.

## Is the end state good

Yes, with caveats. The structural primitives carry weight: `acquireRelease`
genuinely removes the cleanup-duplication problem, and `Fiber.interrupt` from
the React side replacing the `AbortController` + `throwIfAborted` ladder makes
the code shorter and more correct at the same time. The component-side
`Cause.failureOption` + `instanceof` + `Cause.isInterruptedOnly` triage at
`image-upload.tsx:239-250` is the right way to split user-cancel from real
failure, and it lands cleanly.

## Is it idiomatic Effect

Mostly. `Context.Tag` services with `Layer.succeed` live impls and
`Effect.provide` at the top of the React boundary is textbook. `withStatus` as
an HOC over an Effect is the pattern the operators are designed for.
`Data.TaggedError` for `ImageNameTaken` and `yield* new ImageNameTaken()` is
canonical.

Three places that aren't:

1. **`unwrap`'s `catch: (e) => e as ApiError`** (`workflow.ts:44`). This is a
   cast, not a typed catch. Every call into the API trusts the live layer to
   throw the right shape; if it doesn't, the runtime gets an `ApiError`-typed
   value that isn't actually an `ApiError`. Idiomatic Effect would tag at the
   boundary so the `E` channel actually means something downstream — e.g. a
   `Data.TaggedError('ApiError')<{ statusCode, ... }>` plus a `NotFound` arm,
   so `nameExists` can use `Effect.catchTag('NotFound', ...)` instead of
   `Effect.catchIf((e) => e.statusCode === 404, ...)`.

2. **`Math.random()` directly in the workflow** (`workflow.ts:243` and `:375`),
   with a `process.env.NODE_ENV === 'development'` back-door so MSW sentinels
   survive. That's an effectful operation living inside a value that otherwise
   advertises itself as pure. The `Random` service would erase the back-door
   and make tests deterministic.

3. **`liveImageApi.create` chains `Effect.tap(() => invalidate('imageList'))`**
   (`workflow.ts:128-130`). Cache invalidation is a cross-cutting concern that
   the workflow shouldn't have to know about per-call. It works, but it means
   every new mutation has to remember to add a `.tap`.

## Direct-port residue

The body of `uploadFlow` reads in the same order as the original `onSubmit`,
with the same step granularity. Two specific places where the port preserves
shape that Effect would let it change:

- `bulkWriteStart` and `bulkWriteStop` (`workflow.ts:332`, `:373`) sit as
  siblings around the `forEach` upload. They're an acquire/release pair: the
  disk is "in import mode" between them. Modeling as
  `Effect.acquireRelease(bulkWriteStart, bulkWriteStop)` would mean an
  interrupt mid-upload runs `bulkWriteStop` automatically before the
  disk-cleanup finalizer, which is what the cleanup branch at
  `workflow.ts:320-322` has to detect-and-recover today. The state-detection
  in the disk release becomes unnecessary in that branch.

- The snapshot acquire at `workflow.ts:380-388` wraps `snapshotApi.view`, not
  the `diskApi.finalize` call that actually creates the snapshot. See bug
  below.

## Could it be simplified

The workflow proper, modestly. Folding `bulkWriteStart`/`bulkWriteStop` into an
`acquireRelease` removes the state-aware branch in disk cleanup and one
`withStatus` wrapper. It costs the `importStart`/`importStop` step icons
unless the status is emitted from inside the acquire/release pair rather than
from `withStatus`.

The `withStatus` plus `ProgressReporter` services are doing two things —
pushing into React state and giving tests an observation point. They could
collapse into a single `Stream<UploadEvent>` that the component subscribes to
and tests assert against, which removes two `Context.Tag`s and the awkward
`Dispatch<SetStateAction<…>>` parameter type. Whether that's actually simpler
is a judgment call — for one consumer (this modal) threading two callbacks may
genuinely be lighter than introducing a `Stream`.

## Bugs the port exposes

### Fixed: cache invalidation gap in the success path

In the original, the success-path teardown at lines 492-493 uses the
`deleteSnapshot` and `deleteDisk` mutations, declared at lines 230-231
_without_ `onSuccess` invalidation. The mutations that _do_ invalidate
(`deleteDiskCleanup`, `deleteSnapshotCleanup` at lines 254-263) only run from
the failure-recovery `cleanup()`. After a successful upload the cached
`diskList` and `snapshotList` still contain the temp resources until something
else evicts them. The author's comment at line 252 ("in production these
invalidations are unlikely to matter") suggests this was conscious but
mis-judged.

The port routes both deletes through `liveDiskApi.delete` /
`liveSnapshotApi.delete`, both of which `.tap` an invalidation, so success and
failure paths invalidate uniformly.

### Fixed: `closeModal` → `cancelEverything` → `cleanup` race

`closeModal` calls `cancelEverything()` (which only fires the abort), then
`setModalOpen(false)`. The actual cleanup runs asynchronously inside the
original `onSubmit`'s `catch` block. The submit button is gated by
`formLoading = allMutations.some((m) => m.isPending)` (line 275). There's a
real window between "abort fires" and "cleanup mutations start" where no
mutation is pending, so `formLoading` is briefly false and a fast resubmit can
land. A second submit overwrites `disk.current` / `snapshot.current` while
the previous cleanup is still about to read them — the original temp
resources go unreferenced and leak.

The port ties the `running` flag to the fiber lifecycle (`finally` after
`Fiber.await`), and `Fiber.await` doesn't resolve until finalizers complete,
so the submit button stays disabled through the entire teardown. The
pre-existing TODO at line 179 ("make sure cleanup, cancelEverything, and
resetMainFlow are called in the right places") is gesturing at this class of
issue. `acquireRelease` makes "cleanup runs exactly once on every exit path"
structural; the TODO is satisfied for free.

### Preserved: snapshot leak window

Original lines 458-468:

```ts
await finalizeDisk.mutateAsync({ path, body: { snapshotName } })  // snapshot exists
abortController.current?.signal.throwIfAborted()
snapshot.current = await queryClient.fetchQuery(...)              // lift the ID
```

If `finalizeDisk` succeeds (snapshot exists server-side) and either the abort
check fires or `fetchQuery` throws, `snapshot.current` never gets assigned and
`cleanup()`'s `if (snapshot.current)` branch is skipped → temp snapshot leaks.

The port at `workflow.ts:380-388` has the same shape:
`acquireRelease(snapshotApi.view(...), delete)` — the acquire is the _view_,
not the _finalize_. If `view` fails after `finalize` succeeded, no finalizer
is registered. Bug preserved verbatim.

The fix in either world is the same: the resource is "snapshot named
`snapshotName` exists" and the acquire is `finalize`. In Effect terms:
`Effect.acquireRelease(diskApi.finalize(... { snapshotName }), () => snapshotApi.deleteByName(snapshotName))`
with the view as a separate downstream operation. Needs a delete-by-name
endpoint, or an acquire that views-and-registers in one step with explicit
error handling for the view-failed-after-finalize case.

### Minor: latent foot-gun in `cleanup()` branches

Original lines 335-342 has two separate `if` blocks
(`importing_from_bulk_writes`, `import_ready`), not `if`/`else if`. Both read
`diskState` from a const captured before either runs, so this is correct in
practice. If someone later changed the const into a re-fetch, the two branches
could fire sequentially. Port uses `else if` (`workflow.ts:319-326`) which
removes the latent foot-gun.

## Bug introduced by the port

### Precheck non-404 ApiError disappears

Pre-port, the precheck happened in the outer `onSubmit` wrapper before the
modal opened, and a non-404 precheck failure was an uncaught promise
(visible-but-ugly).

Post-port, `submitProgram` folds the precheck and the modal-open callback
into one Effect. A non-404 `ApiError` in the precheck routes through the
Exit-failure branch at `image-upload.tsx:246-250` and lands in
`setModalError`, but `onPrecheckPassed` (which opens the modal) only fired on
precheck success — so the modal is closed and the user sees nothing.

Fix: the Cause pattern-match needs a third arm. If the failure happened
before the modal opened, surface as `setFormError` (or a generic top-level
error) instead of `setModalError`. The simplest signal is a flag set inside
`onPrecheckPassed` and read in the Exit handler, or splitting `submitProgram`
back into two stages with the modal-open between them.

## Bottom line

The acquire/release boundaries (disk import-mode pair, snapshot creation) are
where the port leaves Effect's strongest primitive on the table. The
error-channel cast in `unwrap` is the second thing to fix. The two real
pre-existing bugs that the port silently fixes (cache invalidation, resubmit
race) are themselves a decent argument for the port — they fall out of using
`acquireRelease` and `Fiber` lifecycle correctly, and would be easy to
re-introduce in any imperative rewrite.
