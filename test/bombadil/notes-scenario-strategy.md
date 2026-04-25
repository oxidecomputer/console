# 2026-04-25 — Bombadil Scenario Strategy

## Assessment

Bombadil is most likely to be useful for the console as an invariant checker
around known-interesting states, not as a broad random crawler.

The console is route-heavy, form-heavy, and domain constrained. Random clicks
can cover routes, but they rarely construct valid mutations, permission
boundaries, unusual API response shapes, or half-completed UI states. Those are
the states where past console bugs have tended to live: stale modal errors,
duplicate toasts, stuck loading/progress UI, role-specific crashes, weird API
shape render failures, and polling/rerender interaction bugs.

The right unit is therefore a scenario:

- mock API state
- user identity
- start URL
- optional short prelude for ephemeral UI state
- short local fuzz window
- shared core invariants plus scenario-specific non-vacuity checks

URL-only breadth runs still have value as cheap smoke coverage, but they should
not be expected to find most stateful bugs.

## Likelihood

This has a medium-high chance of finding useful regressions if it stays
scenario-centered. It has a low chance of producing durable signal as generic
random clicking over the whole app.

The first experiments validate the base primitives:

- `MOCK_API_SCENARIO` can seed a server-start DB state.
- `MOCK_API_USER` can run Bombadil as a specific mock user.
- `test/bombadil/scenarios.json` is enough to describe early scenario runs.
- `run-slot.sh` must clear output directories before each run, or stale trace
  data corrupts summaries.

The first experiments also expose the key risk:

- Generic `clicks` quickly follow sidebar links and breadcrumbs away from the
  target state.
- Fixed coordinate preludes can open simple modals, but are brittle for
  combobox selection and failed-submit setup.
- `exit=0` is ambiguous until the runner reports whether the scenario actually
  exercised its intended state.

## Work Remaining

Rough effort estimates with coding-agent help:

- 1-2 days: add trace-summary/non-vacuity reporting and harden one scenario end
  to end.
- 3-5 days: settle the scenario fixture pattern, prelude story, and 2-3 useful
  scenarios.
- 1-2 weeks: build a credible 6-8 scenario suite that is worth running
  regularly and maintaining.

Useful means failures identify a meaningful domain state, such as "disk attach
limit modal after failed submit," not merely "Bombadil clicked around for three
minutes."

## How To Use This In Practice

Use Bombadil as an exploratory invariant layer, not as a replacement for E2E
tests.

Suggested workflow:

1. Define scenarios in `test/bombadil/scenarios.json`.
2. Add server-start mock DB patches in `mock-api/msw/scenarios.ts` for state
   that can be represented in the DB.
3. Use short preludes only for ephemeral UI state: open menus, open modals,
   half-filled forms, failed-submit state, and progress UI.
4. Run targeted scenarios locally when touching related code:

   ```sh
   API_MODE=nexus npm run build
   test/bombadil/run-scenario.sh 1 disk-attach-limit 60s
   ```

5. Read the non-vacuity summary first. A clean run that never reached the target
   state should be treated as inconclusive.
6. Promote deterministic narrow bugs to Playwright or unit tests after root
   cause is understood.
7. Keep Bombadil scenarios for churn, liveness, timing, and broad invariant
   failures that are awkward to encode as a single deterministic E2E.

CI should eventually run a small stable subset with short time limits. Longer
scenario sweeps are better suited to scheduled runs or pre-release checks until
flake characteristics are better understood.

## Next Step

Do not add many more scenario specs yet. First add a trace summary that reports:

- target route/state reached
- modal/menu opened
- mutation attempted
- expected error response or inline error observed
- toast observed
- spinner/progress UI observed and settled
- route count and top routes
- action histogram

Then harden `disk-attach-limit` until the summary can say it opened the attach
modal, selected the over-limit disk, submitted the form, and observed the
expected inline error. Use that as the template for the other stateful scenarios.
