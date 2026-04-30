# Effect tour — image upload

A short tour of the image-upload Effect port for someone trying to understand
the point of Effect. Files: `app/forms/image-upload-workflow.ts`,
`app/forms/image-upload-workflow.spec.ts`, `app/forms/image-upload.tsx`.
Pre-port version of `image-upload.tsx` lives at `trunk()`.

## Five things worth seeing

**Resource bracketing** (`workflow.ts:331`, `:402`, `:419`). Three
`acquireRelease` calls. Cleanup is attached to acquisition; the runtime
guarantees it runs on every exit path. The original's `cleanup()` function
(state-aware reconstruction of teardown) and the duplicated success-path
teardown both go away.

**`Fiber.interrupt`** (`image-upload.tsx:217`). One call walks the tree, runs
every finalizer in reverse, aborts in-flight fetches. Replaces
`AbortController` + `ABORT_ERROR` sentinel + six `throwIfAborted()` calls +
the `anySignal` polyfill.

**`Cause`/`Exit`** (`image-upload.tsx:247-269`). Three-way split: success,
typed failure, interrupt. The error channel is part of the type
(`UploadFailure`: API error, transport error, chunk timeout, name taken).
Original used `if (e !== ABORT_ERROR)` because `try/catch` flattens
cancellation and failure.

**Services + Layers** (`workflow.ts:73-120`, `spec.ts:64-113`). The workflow
has no `import { api }` — only `yield* DiskApi`, `yield* UploadNames`,
`yield* UploadPolicy`, etc. Test layers aren't replacing anything, they're
the only way to run it. DI checked by the type system.

**Typed errors and policies** (`workflow.ts:38-71`, `:383-389`).
`Effect.tryPromise` maps rejected fetches into `ApiTransportError`;
`Effect.timeoutFail` maps slow chunk uploads into `ChunkUploadTimedOut`;
`UploadPolicy` supplies timeout and retry settings as ordinary dependencies.
The lesson is that failure modes and policies can be values in the program,
not comments near a `catch`.

## Reading order

To see the runtime rather than the operators:

1. `uploadFlow`'s opening (`workflow.ts:280-329`) — `Effect.scoped` and the
   disk bracket.
2. Nested brackets (`workflow.ts:402-423`) — import-mode and snapshot.
3. `runFork` / `Fiber.await` / `Exit` (`image-upload.tsx:237-269`) — the
   door from React into the runtime and back.
4. `Fiber.interrupt` (`image-upload.tsx:217`) — the third door.
5. `UploadNames` / `UploadPolicy` in the spec (`spec.ts:101-113`) — the
   smallest example of swapping capabilities for tests.

The "promises with extra steps" reading falls apart at step 4. A `Promise`
can't be interrupted from outside, and an `AbortSignal` doesn't unwind a stack
of cleanups. That's the runtime value, and `acquireRelease` + `Fiber.interrupt`
is the cheapest place to feel it.
