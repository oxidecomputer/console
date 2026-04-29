# Effect: what it actually is, and how `run*` works

Date: 2026-04-29

Companion to `2026-04-29-effect-image-upload-survey.md`. That note translates
the image upload pain points into Effect operators. This note covers the
deeper question: what *is* Effect, where does the runtime come in, and what
do the tiers of incremental adoption actually give you?

## Effect is a runtime, not a utility library

Calling `Effect.tryPromise(...).pipe(Effect.retry(...), Effect.timeout(...))`
does not chain function calls that retry and timeout. It builds an immutable
*value* — a tree of instructions — that, when interpreted, will retry and
timeout. Like a tiny program in a tiny language. The Effect runtime is the
interpreter that executes those programs.

This distinction is load-bearing because of what the runtime guarantees:

- **Structured concurrency.** When a fiber is interrupted, the runtime walks
  the tree: every child fiber is interrupted, every finalizer runs in reverse
  acquisition order, deterministically. AbortController + try/finally is
  best-effort by comparison.
- **Resource safety as a type guarantee.** `Effect.acquireRelease` cannot
  leak, because the runtime owns the lifecycle. There is no "did I remember
  to clean up on this code path."
- **Time as a service.** `Schedule.exponential("100 millis")` does not call
  `setTimeout`. It emits an instruction the runtime executes against a
  `Clock` service. Swap in `TestClock` and `Effect.retry` advances virtual
  time. You cannot do that with raw `setTimeout`.
- **Dependencies as a type.** The `R` parameter in `Effect<A, E, R>` is not
  a DI library bolted on — it is part of the core type. The compiler refuses
  to run an Effect that requires services until you provide them. Imports
  become an antipattern; everything flows through Layers.
- **Determinism.** Same Effect + same Layer = same behavior. No hidden
  global state, because all of it is explicit in the type.

On top of that primitive there is a stdlib that all desugars to Effect:

- `Stream` — resourceful, backpressured streaming
- `Schema` — parsing/validation/derivation (Zod-like, unified with the
  failure model)
- `STM` — software transactional memory
- `Layer` — DI graph composition
- `Match` — exhaustive pattern matching
- `Cause` — structured failure (parallel failures, defects vs. expected
  errors, traces)
- `Scope`, `FiberRef`, etc.

These are not separate libraries that integrate; they are all the same thing.

Underneath all of that is a programming style. In a fully-Effect codebase
you push `runPromise` to the very edges (event handler, HTTP entrypoint) and
everything inside is Effects all the way down. Functions return Effects,
services return Effects, errors are part of the type, dependencies are part
of the type. Closer to Haskell's IO than to async/await.

## How `run*` works — the entry point to the runtime

There is no ambient runtime context you have to be inside. `Effect.runPromise`
(and its siblings) **is** the wrapping. Each call to a runner spins up an
interpreter, executes the Effect to completion, and returns.

Analogy: like `eval()`. There is no global "JS evaluator context" you must
enter — `eval(code)` *is* the act of invoking the evaluator. Same with
`runPromise(effect)`.

```ts
// VALUE — does nothing. Just a JS object describing a computation.
const program = Effect.tryPromise(() => fetch("/api/disk")).pipe(
  Effect.retry(Schedule.recurs(2)),
  Effect.timeout("30 seconds"),
)

console.log(program)  // logs an Effect object. No fetch happened.

// EXECUTION — this is the runtime. NOW the fetch happens.
const result = await Effect.runPromise(program)
```

`Effect.tryPromise`, `pipe`, `Effect.retry`, `Effect.timeout` — none of those
*do* anything. They build a tree of instructions. When `runPromise` is called,
the runtime walks the tree, executing each step.

### The runners

| Runner                | Returns                  | Notes                                |
|-----------------------|--------------------------|--------------------------------------|
| `Effect.runPromise`   | `Promise<A>`             | Rejects on failure                   |
| `Effect.runPromiseExit` | `Promise<Exit<A, E>>`  | Never rejects; pattern-match on Exit |
| `Effect.runFork`      | `Fiber<A, E>`            | Background; interrupt via `Fiber.interrupt` |
| `Effect.runSync`      | `A`                      | Only for Effects with no async ops   |
| `Effect.runSyncExit`  | `Exit<A, E>`             | Sync + Exit                          |

### Why fully-Effect codebases feel "ambient"

In a server written entirely in Effect you typically see exactly one
`Effect.runPromise(mainProgram)` at the very top, and everything below is
Effects composed via `Effect.gen` and `pipe`. So it *feels* like there is an
ambient runtime, because there is a single root fiber that everything runs
under. But that is a code organization choice, not a framework requirement.
The actual rule: an Effect value does not execute until something calls a
`run*` on it.

### The "shared runtime" optimization

If you want multiple `run*` calls to share a Context — same `LiveDiskApi`
instance across many invocations — you can build a `ManagedRuntime` once:

```ts
const runtime = ManagedRuntime.make(Layer.mergeAll(LiveDiskApi, LiveImageApi))
// later, anywhere
const result = await runtime.runPromise(program)
```

Functionally equivalent to `runPromise(program.pipe(Effect.provide(layer)))`
each time, just cached. Not a wrapping you have to be inside of.

## Where `run*` enters the incremental plan

Run calls always sit at the boundary between Effect-world and Promise-world.
At each step the boundary moves up.

| Step | Where `run*` lives        | Which `run*`              | Count per upload |
|------|---------------------------|---------------------------|------------------|
| 1    | inside `postChunk`        | `runPromise`              | N (one per chunk) |
| 2    | inside `postChunk`        | `runPromise`              | N |
| 3    | wrapping the chunk loop   | `runPromise`              | 1 |
| 4    | wrapping the chunk loop   | `runPromise`              | 1 |
| 5    | wrapping the chunk loop   | `runPromise` + `provide`  | 1 |
| 6    | wrapping `onSubmit`       | `runFork` + `Fiber.await` | 1 (with provide) |
| 7    | wrapping `onSubmit`       | `runFork`                 | 1 |
| 8    | wrapping `onSubmit`       | `runFork`                 | 1 |

The interesting transitions:

- **2 → 3**: `run*` climbs out of the per-chunk inner loop into the loop wrapper.
  Now the runtime spins up once per upload, not once per chunk.
- **5 → 6**: switch from `runPromise` to `runFork` because the cancel button
  needs a `Fiber` handle. `runPromise` does not give you one;
  `runFork` returns a `Fiber.RuntimeFiber` whose `Fiber.interrupt` replaces
  `AbortController.abort()`.

By step 8 the runtime spins up once per upload and runs the entire workflow
as a single fiber tree, with structured concurrency and finalizers running
in the right order automatically.

## Tiers of value in the incremental plan

The plan in the survey doc walks through eight steps. Each step is real work,
but you should understand what tier of Effect's value you are buying at each:

**Tier 1 — Steps 1–4** (wrap leaves, swap `p-retry`/`p-map`/`anySignal`).
You are using Effect as a fancy promise library. You get composable retry,
concurrency, and timeout values. Most of what makes Effect *Effect* is
unused. Bundle cost is hard to justify on its own. Useful for learning the
operators, but if you stopped here a reader could reasonably ask "why not
just keep `p-retry`?"

**Tier 2 — Steps 5–6** (services + `acquireRelease`). Now the runtime earns
its keep. Resource safety is a type guarantee. Dependencies are explicit.
Orchestration becomes unit-testable. Structured concurrency starts to matter
because the workflow has scoped resources and finalizers. This is where
"Effect is a runtime" becomes felt rather than asserted.

**Tier 3 — Steps 7–8** (full workflow as one Effect, services for everything).
Now you are programming in Effect. `Cause` for proper failure modeling,
`TestClock` for time-dependent tests without real time, `Schema` available
if you want to validate the image header in the type system. The full
ecosystem becomes available. The component shrinks to "render form, run
flow, render UI."

So when someone says "Effect is a runtime, not a utility library," they
mean: the value is in *committing* to the model. The composable-utilities
framing is technically true but misses the point — like describing React as
"a DOM manipulation library." Yes, but no.

For the learning exercise: tier 1 will teach you operators, tier 2 is where
it starts to click, tier 3 is where you would actually understand why Effect
exists. Plan to reach at least tier 2 before forming an opinion about the
ecosystem.

## Practical reading order

1. Read this doc to set expectations about what each step buys.
2. Read `2026-04-29-effect-image-upload-survey.md` for the operator-by-operator
   translation of the image upload pain points.
3. Walk through the steps. After step 4, the operators should feel concrete.
   After step 6, the runtime model should feel concrete. After step 8, the
   programming style should feel concrete.

If at any tier the tradeoffs do not feel worth it for this codebase, that is
a valid finding — the goal is to learn the model, not to ship Effect to
production.
