# Effect tour — image upload

A short tour of the image-upload Effect port for someone trying to understand
the point of Effect. Files: `app/forms/image-upload-workflow.ts`,
`app/forms/image-upload-workflow.spec.ts`, `app/forms/image-upload.tsx`.
Pre-port version of `image-upload.tsx` lives at `trunk()`.

## Five things worth seeing

**Resource bracketing** (`workflow.ts:302`, `:369`, `:386`). Three
`acquireRelease` calls. Cleanup is attached to acquisition; the runtime
guarantees it runs on every exit path. The original's `cleanup()` function
(state-aware reconstruction of teardown) and the duplicated success-path
teardown both go away.

**`Fiber.interrupt`** (`image-upload.tsx:210`). One call walks the tree, runs
every finalizer in reverse, aborts in-flight fetches. Replaces
`AbortController` + `ABORT_ERROR` sentinel + six `throwIfAborted()` calls +
the `anySignal` polyfill.

**`Cause`/`Exit`** (`image-upload.tsx:234-262`). Three-way split: success,
typed failure, interrupt. The error channel is part of the type
(`ApiError | ImageNameTaken`). Original used `if (e !== ABORT_ERROR)` because
`try/catch` flattens cancellation and failure.

**Services + Layers** (`workflow.ts:47-85`, `spec.ts:64-87`). The workflow
has no `import { api }` — only `yield* DiskApi`. Test layers aren't
replacing anything, they're the only way to run it. DI checked by the type
system.

**Operators as values** (`workflow.ts:357`). `Effect.retry(Schedule.recurs(2))`,
`Effect.timeout('30 seconds')`. Policies are values you compose, not flags
you pass.

## Reading order

To see the runtime rather than the operators:

1. `uploadFlow`'s opening (`workflow.ts:280-329`) — `Effect.scoped` and the
   disk bracket.
2. Nested brackets (`workflow.ts:369-391`) — import-mode and snapshot.
3. `runFork` / `Fiber.await` / `Exit` (`image-upload.tsx:225-262`) — the
   door from React into the runtime and back.
4. `Fiber.interrupt` (`image-upload.tsx:210`) — the third door.

The "promises with extra steps" reading falls apart at step 4. A `Promise`
can't be interrupted from outside, and an `AbortSignal` doesn't unwind a stack
of cleanups. That's the runtime value, and `acquireRelease` + `Fiber.interrupt`
is the cheapest place to feel it.
