# Codex Review: Effect Image Upload Port

Date: 2026-04-29

Review target: `app/forms/image-upload-workflow.ts`,
`app/forms/image-upload-workflow.spec.ts`, and the Effect-facing parts of
`app/forms/image-upload.tsx`.

The code is basically correct, and it is a meaningful Effect example. The best
parts are the parts Effect is actually good at: bracketing temp resources,
interrupting a running workflow, representing the whole submit as one fiber, and
testing orchestration with fake services.

## Findings

1. `app/forms/image-upload-workflow.ts:40` — `unwrap` uses `Effect.promise`, so
   rejected API promises become defects while generated API response errors stay
   in the typed `ApiError` channel. That is coherent if transport failures are
   considered defects, and it avoids the previous `catch: (e) => e as ApiError`
   lie. The design choice should be intentional: if network/CORS failures are
   user-recoverable upload failures, `Effect.tryPromise` plus a real
   `NetworkError` / `ApiTransportError` tag would make the failure model more
   honest.

2. `app/forms/image-upload-workflow.ts:242` — `Math.random()` and the
   `NODE_ENV === 'development'` sentinel path are direct-port residue. For an
   idiomatic Effect version, randomness should be a service/capability,
   especially in a pedagogical example that is otherwise teaching dependency
   injection through `Context.Tag` and `Layer`.

3. `app/forms/image-upload-workflow.ts:353` — `Effect.timeout('30 seconds')`
   introduces `TimeoutException`, but the boundary treats it like any other
   non-interrupt failure. That works, but it misses a teaching opportunity:
   timeout could be mapped into a domain error or tagged upload error. Effect's
   timeout is a typed failure, not just a thrown timeout.

4. `app/forms/image-upload-workflow.ts:392` — the "image name taken after
   upload" TODO is still a real product limitation. The workflow currently
   deletes the snapshot even though the comment says preserving it could let the
   user recover without re-uploading.

## Correctness

The port is strongest around cleanup and cancellation. `Effect.acquireRelease`
and `Effect.acquireUseRelease` materially improve the original form because temp
disk cleanup, import-mode stop, and snapshot deletion are now structurally
attached to acquisition. That is the point where this stops being a Promise
wrapper exercise and demonstrates Effect's runtime value.

The snapshot cleanup shape is now right: `diskApi.finalize` is bracketed before
`snapshotApi.view`, so a successful finalize registers the delete finalizer even
if the subsequent view fails.

Interruption coverage is now consistent for generated API calls: disk view,
snapshot view, and the image-name precheck all route through APIs that receive
Effect's interrupt signal. The remaining correctness caveats are mostly about
typed honesty and product behavior, not the happy path. The tests cover success,
API failure with cleanup, interrupt during upload, and the precheck branches.
They are useful tests, and they demonstrate the main benefit of extracting the
workflow behind services.

## Elegance

`uploadFlow` is easier to reason about than the old mutation/ref/abort-controller
version. The sequence of domain steps is still visible, and cleanup lives near
resource acquisition instead of being reconstructed later from refs.

The ceremony is high for a React codebase that otherwise uses React Query and
plain hooks. `Context.Tag`, `Layer`, `Effect.scoped`, `Fiber`, `Exit`, `Cause`,
`Data.TaggedError`, and `Schedule` are a lot of new surface area for one form.
The code earns much of that complexity here, but it would be a maintenance
liability if this remained the only Effect code in the repo.

`StepStatus` and `ProgressReporter` as callback services are pragmatic. They
are not especially elegant, but they keep React state at the boundary and make
tests straightforward. A stream of upload events might be conceptually cleaner,
but it would add another Effect concept without clearly reducing complexity for
this single consumer.

## Idiomatic Effect

The service/layer shape is idiomatic. `Context.Tag` services with `Layer.succeed`
implementations, then `Effect.provide` at the React boundary, is the standard
dependency-injection pattern.

The bracketing is also idiomatic. The disk, import mode, and snapshot are exactly
the kind of resources `acquireRelease` / `acquireUseRelease` are designed to
model.

The less idiomatic parts are the untagged `ApiError` shape, the direct
`Math.random()` calls, and the implicit decision to treat rejected generated API
promises as defects. A more fully Effect-shaped version would make transport
errors, timeouts, name conflicts, and API errors explicit members of the failure
model.

## Pedagogical Value

This is a good teaching example if read around the resource and fiber boundary:

- `Effect.scoped` plus `acquireRelease` shows how cleanup becomes part of the
  program structure.
- `Fiber.interrupt` shows why Effect is more than decorated promises.
- `Exit` / `Cause` shows the difference between success, typed failure, defect,
  and interruption.
- fake `Layer`s in Vitest show why the dependency parameter is useful.

As a final artifact, it introduces too many concepts at once. The clearest
lesson is narrower: resources and cancellation are part of the executable
structure, not conventions enforced by careful `try` / `catch` placement.

## Bottom Line

For this particular flow, Effect is a strong fit. The upload has ordered steps,
bounded concurrency, retries, timeouts, progress reporting, cancelation, and
multiple resources that must be cleaned up on every exit path.

For this codebase, adopting Effect only for this form would still be a
tradeoff. The runtime and conceptual overhead are real. If another similarly
shaped workflow appears, this port becomes a more compelling pattern. If not,
it remains a valuable exercise and a useful reference for what Effect buys.
