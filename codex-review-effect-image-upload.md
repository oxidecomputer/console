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

1. `app/forms/image-upload-workflow.ts:423` — the "image name taken after
   upload" TODO is still a real product limitation. The workflow currently
   deletes the snapshot even though the comment says preserving it could let the
   user recover without re-uploading.

2. `app/forms/image-upload-workflow.ts:105` — `ApiError` is still a plain object
   from the generated API layer rather than a tagged Effect error. The workflow
   now tags transport errors and timeout errors, so this is the remaining place
   where failure matching is less precise than an Effect-native design would be.

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
Effect's interrupt signal. Transport failures are now typed as
`ApiTransportError`, chunk timeouts are mapped into `ChunkUploadTimedOut`, and
the UI boundary gives both distinct user-facing messages. The remaining
correctness caveats are mostly about generated API error shape and product
behavior, not the happy path. The tests cover success, API failure with cleanup,
interrupt during upload, chunk timeout, and the precheck branches. They are
useful tests, and they demonstrate the main benefit of extracting the workflow
behind services.

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

The failure model is now much closer to idiomatic Effect: generated API response
errors remain `ApiError`, transport rejections become `ApiTransportError`,
timeouts become `ChunkUploadTimedOut`, and precheck conflicts become
`ImageNameTaken`. Generated names and upload policy are also supplied as
services, which makes the workflow more deterministic in tests and keeps
environment-specific e2e sentinels out of the core program.

The least Effect-native remaining piece is the untagged `ApiError` shape. A
fully Effect-shaped generated client would expose tagged API errors so callers
could use `catchTag` rather than matching optional `statusCode` / `errorCode`
fields.

## Pedagogical Value

This is a good teaching example if read around the resource and fiber boundary:

- `Effect.scoped` plus `acquireRelease` shows how cleanup becomes part of the
  program structure.
- `Fiber.interrupt` shows why Effect is more than decorated promises.
- `Exit` / `Cause` shows the difference between success, typed failure, defect,
  and interruption.
- fake `Layer`s in Vitest show why the dependency parameter is useful.
- `ApiTransportError`, `ChunkUploadTimedOut`, `UploadNames`, and `UploadPolicy`
  show how domain errors and environment-specific capabilities can be pulled
  into the typed program instead of being implicit side effects.

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
