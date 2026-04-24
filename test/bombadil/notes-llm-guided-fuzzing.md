# 2026-04-23 — Mixing LLM-orchestrated actions with bombadil fuzzing

Discussion notes, preserved mostly verbatim. Starting point was the
observation that the existing bombadil profiles aren't getting mutations to
happen often enough (see `NOTES.md` round-2 record — most runs produced 0
toasts, `toastsClear`/`noDuplicateToasts` are vacuous), and that the natural
next step is to mix deliberate actions orchestrated by an LLM with the
randomized exploration bombadil already does.

## Is that a thing?

Yes, it's an active area — and explicitly named. "LLM-guided fuzzing" is
the broad term; for web UIs the nearer cousins are tools like Stagehand,
browser-use, Magnitude, and Anthropic's own computer-use SDK, plus academic
work on LLM-steered exploration of symbolic/concolic fuzzers. The pattern
— LLM picks a high-level intent (e.g. "create a project, put a disk on
it, try to detach"), fuzzer does local mutations around each step,
properties run continuously — is exactly the hybrid shape people are
converging on.

The catch is that no off-the-shelf tool combines it with bombadil-style
runtime invariants out of the box, at least none I'm aware of. You'd be
stitching the pieces. Two constraints worth calling out before committing
to that:

1. **Bombadil's spec runs in embedded V8 with no network.** That's already
   why MSW doesn't work (bombadil issues #98/#105). A custom
   `ActionGenerator` that calls an LLM mid-run isn't directly possible —
   you'd either have to drive the LLM from outside (restart bombadil per
   scenario with a tailored start URL and tighter action mix, which is
   roughly what the current manual profile matrix is doing), or patch
   bombadil to expose host calls to the spec.
2. **You lose determinism for the LLM-steered portion.** Bombadil's value
   proposition leans heavily on "replay any trace exactly." A
   nondeterministic LLM in the loop breaks that for the orchestrated
   segments; you'd keep determinism only for the fuzzing windows between
   LLM decisions.

The practical shape that sidesteps both: use Playwright + computer-use (or
Stagehand) to script the _semantic skeleton_ that gets you to an
interesting state (create project → create disk → attach → navigate to
detail), then hand off to a short bombadil run pinned to that page with a
narrow profile. The same `spec-shared.ts` properties run either way —
they're pure DOM predicates. Less cohesive than one unified harness, but
buildable today and the failure modes stay legible.

Worth it over just tuning the fuzzer? Probably yes for mutation-producing
flows specifically, where the space of "valid form submissions" is the
bottleneck and random `TypeText` has ~0% yield. Probably no for coverage
breadth, which the `breadth` profile already does well.

## What can you actually hand to bombadil?

URL is what the CLI takes, but DB state is already within reach without
changing bombadil — it falls out of process lifetimes. In the current
setup the mock-api is a long-lived Node process
(`tools/start_mock_api.ts`) that holds the db in memory. Every HTTP
request mutates the same in-process tables, and nothing resets between
page loads. So whatever touches `:12220` leaves state there until the
process dies.

Two practical ways to "hand bombadil a DB state" without adding features:

1. **Same process, sequential drivers.** Start mock-api and vite preview,
   run the LLM/Playwright phase against them, shut down just the LLM
   driver, then launch bombadil pointed at the same preview URL. Bombadil
   inherits whatever state the LLM phase left behind. The only thing
   blocking this today is that `run-slot.sh` owns the mock-api lifecycle
   — you'd split it so the orchestrator owns mock-api and bombadil is
   invoked as a child.
2. **Seed endpoint on mock-api.** Add a `/__test/seed` route that accepts
   a JSON snapshot and installs it into `db`. Then scenarios are just
   files: `scenario-disk-detach.json`, `scenario-instance-starting.json`,
   etc. The LLM phase either authors these directly or produces them by
   running a flow and dumping `db` at the end. This buys reproducibility
   — you can rerun a scenario byte-for-byte — which (1) loses because
   Playwright flows aren't deterministic either.

(2) is maybe a dozen lines. The db object in `mock-api/msw/db.ts` is
already a plain JS container; a seed endpoint that `Object.assign`s a
decoded JSON into it would cover most cases. Failure modes to think
about: foreign-key consistency (images → snapshots → disks), UUID
validity (the safety test enforces RFC 4122), and whatever per-request
derived state lives outside the tables. Tractable.

Tangent: if you go this route, the LLM phase probably shouldn't use
Playwright at all for the setup — it should hit the Oxide API directly.
Same `@oxide/api` client, no browser, much faster, deterministic for a
given seed-plus-script. Playwright only earns its keep when you need
_browser_-level semantic intent (clicking through a multi-step form that
enforces cross-field constraints the API client doesn't). For "leave the
db with project X, disks attached to instance Y, one disk in
`attaching`", direct API calls are strictly better.

## But what about UI state?

Right — and that's where the clean split starts to fray. A few
observations that make the gap smaller than it first looks, then the
residual.

**Most UI state in this app is URL-encoded already.** Side modals are
routes (`/projects/mock-project/instances/db1/disks-attach`), tabs sync to
`?tab=` via `QueryParamTabs`, form pages are `-new` or `-edit` paths.
That's a deliberate convention (the `CLAUDE.md` line: "use routes to
capture state"). So for a lot of what looks like UI state — open modal,
specific tab, editing-a-thing — the LLM phase's output is still just a
URL. Combined with a db seed, you can reconstruct most states.

**The residual is ephemeral UI state**: partially-filled form fields,
selected rows in a table, dropdown open, scroll position, focus. None of
that is URL-encoded. For that, there are two options and bombadil
supports the cheap one:

1. **Attach bombadil to an existing browser.** As far as I know, not a
   thing — bombadil owns its browser. CDP attach would require forking
   the tool. Rule this out.
2. **Prelude action sequence.** Bombadil's `ActionGenerator` is just a
   function that yields actions. You can write a stateful generator that
   replays a deterministic prefix (click this, type that, click here)
   and then delegates to the normal weighted mix once the prefix is
   exhausted. Deterministic prelude, random exploration. That handles
   "start with a half-filled form" cleanly because the prefix _is_ the
   state.

So the handoff is three things, in order of increasing awkwardness: db
seed JSON (easy, ~dozen-line endpoint), URL with path/query (free),
prelude generator (stateful but straightforward). Between them you can
reach almost any state you'd want to fuzz from.

Where it genuinely doesn't work: states that depend on _timing_ or
_backend responses from a specific sequence of previous requests_ —
e.g., a form whose validation error only appears because the server
returned a particular error shape on a previous submit. The prelude can
recreate the sequence, but if the db seed alone doesn't reproduce the
server response, you'd need request recording/replay too. Different
project.

Honest read: the model of "LLM plans, bombadil fuzzes from the planned
state" is tractable for this app specifically because it leans heavily
on URLs. In an app with lots of non-URL UI state (a rich SPA editor,
say), the prelude-generator residual would dominate and the hybrid would
stop feeling like a clean split.

## So LLM just generates the prelude sequence?

Pretty much, yes — and the nice part is the LLM only has to be in the
loop _once_ per scenario, not at runtime.

The workflow that falls out:

1. **Discovery run.** LLM agent (computer-use or Playwright+vision)
   drives the browser to the target state, recording every action it
   takes as it goes. Constrain the agent to bombadil's action vocabulary
   (`Click by role+name`, `TypeText`, `Scroll`, `Navigate`) so the
   recording is replayable without translation.
2. **Freeze.** Serialize the recorded sequence to
   `preludes/<scenario>.json`. Pair with the db seed from the same
   session if you want the whole reachable state captured.
3. **Replay.** Bombadil's prelude generator reads the JSON and yields
   those actions deterministically, then flips to the weighted mix.
   Every subsequent run is pure bombadil — no LLM, no cost, no
   nondeterminism.

So the LLM solves the _authoring_ problem (how do I get here?) once, and
the output is a normal test fixture. After that it's just replay. The
agentic cost and flakiness stay out of the hot path.

Two real wrinkles:

- **Prelude drift.** If the app's DOM changes (button rename, form
  restructure), recorded preludes break the same way recorded E2E tests
  do. Solvable the same way — rerun the discovery agent to regenerate
  when it drifts. Cheap if the scenarios are small.
- **Vocabulary constraint.** The LLM has to pick actions bombadil can
  emit. If it reaches for a Playwright-only move (keyboard shortcut,
  `page.evaluate`, direct CDP), the recording isn't portable. Prompting
  - tool restriction handles this — don't give the agent those tools in
    the first place.

The bigger leverage is scenarios-as-code. You end up with a library of
labeled preludes (`instance-attaching-disk.json`,
`firewall-rule-form-half-filled.json`,
`snapshots-list-with-deleted-source-disk.json`), each pairing a db seed
with an action sequence, each bombadil-runnable. That's a much more
useful artifact than "run bombadil on URL X and hope."

## Open caveats

- Bombadil's exact `ActionGenerator` API — whether a prelude-then-
  delegate generator composes as cleanly as described above — needs to
  be verified in the source before committing to this. The conceptual
  shape is fine; the specific glue may take spelunking.
- Unknown whether bombadil exposes a way to externally feed a seeded
  RNG so the "random" phase after the prelude is itself deterministic.
  If not, rerunning a scenario gives the same prelude but different
  fuzz; not necessarily bad (more coverage over repeats) but worth
  knowing.
- Agent vocabulary restriction is easy with Anthropic tool use (just
  don't define the verboten tools). Harder with general-purpose browser
  agents that already have rich action sets — would need to wrap or
  fork.
