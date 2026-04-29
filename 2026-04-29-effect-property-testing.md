# Property testing the image-upload Effect workflow

A short note on what property-based testing would look like for this workflow,
and why it doesn't end up paying off here. Worth keeping because the framing
applies to any orchestration-heavy code in this repo.

## The shape

`fast-check` is the standard property-testing library in TS:

```ts
fc.assert(
  fc.asyncProperty(generator, async (input) => {
    // ...run the unit under test...
    // ...assert an invariant that must hold for ALL inputs...
  })
)
```

100 random samples per property by default, with automatic shrinking to a
minimal failing case. No fast-check usage in this repo today; adopting it
means a dev dep + a new pattern.

## The property worth wanting

The most attractive single property for `uploadFlow` is the **cleanup
invariant**: for any (failure point × success-or-interrupt) combination, the
workflow's exit leaves no temp disk and no temp snapshot behind. Eight lines
of property code, encoding the safety claim of `acquireRelease` across the
full cartesian product of exit paths.

```ts
const failPoint = fc.constantFrom(
  null,
  'createDisk',
  'bulkWriteStart',
  'bulkWrite',
  'bulkWriteStop',
  'finalize',
  'createImage',
  'interrupt'
)

fc.asyncProperty(failPoint, async (failAt) => {
  // ...run uploadFlow with this failure injected, await exit...
  expect(state.disks.size).toBe(0)
  expect(state.snapshots.size).toBe(0)
})
```

## Why it doesn't pay off here

The property requires asserting on _state of the API_ after the workflow
exits. That state has to come from somewhere — either the real API (we're not
running e2e in vitest) or a fake. To test "the disk got cleaned up," the fake
needs a `disks` map that the workflow's `delete` call removes from. To test
"the snapshot got cleaned up before the disk," the fake needs to enforce that
ordering as a precondition. To test "the workflow used the right cleanup path
for each disk state," the fake needs the disk state machine.

That fake is a reimplementation of the part of the Oxide API the workflow
talks to. It encodes business rules that live in Omicron, drifts when those
rules change, and silently lies if its preconditions are wrong. The tests
written against it pass against the model, not the reality.

Property testing doesn't escape this — it _amplifies_ it, because the value
proposition (run the property over many cases) only works if every case is
checked against a faithful model.

## Where it would pay off in this repo

Pure code with clean invariants over inputs:

- **Validators** like `validateMember` in `app/forms/subnet-pool-member-add.spec.ts`
  — generate random subnet/prefix-length combinations, assert valid inputs
  produce empty error objects, invalid inputs produce specific keys.
- **Parsers and formatters** for IPs, names, durations, file sizes.
- **Pure transformations** that map between API and form shapes.

The pattern: the unit under test is a pure function, the property is an
algebraic statement over its inputs, no fake of any external system is
required.

## Verdict

For orchestration code that's mostly a script of API calls, property testing
looks attractive but loses to the same problem that defeats elaborate fakes:
the testing infrastructure becomes a parallel implementation of the
dependency. Keep fast-check in mind for pure logic. Don't reach for it on
code where the interesting behavior lives in the I/O.
