# 2026-04-23 — Bombadil: try different starting pages, record what each hits

## Goal

Find bugs with the bombadil spec at `test/bombadil/spec.ts` by varying the
starting URL. Keep a running record of starting pages tried, run duration,
violations found, and qualitative observations (what bombadil did, which
routes it reached, notable resources it created).

The motivation: the existing safety properties (`noErrorBoundary`,
`noUncaughtExceptions`, `loadingResolves`, `mainContentAppears`, `toastsClear`,
`noDuplicateToasts`, `menuSurvivesWait`) cover the dominant bug classes
seen in recent issues. What limits the test isn't more properties; it's
whether random exploration reaches the affected code paths. Starting in
different places should expand coverage cheaply.

Write results into the table in this file **as each run finishes**, not at
the end.

## Setup (one-time, per fresh session)

1. Confirm rebase/upgrade work landed. Current stack on the `bombadil`
   bookmark:

   ```
   @  qkyvulzu  add targeted bombadil properties
   ○  kqszqmwz  bombadil | upgrade bombadil to 0.4.5, modernize spec
   ○  ywlqwypm  iterating until we find a bug
   ○  uwltnyqp  temporary proxy to localhost:12220
   ○  xxwykkqo  try bombadil
   ```

   `jj log -r 'ancestors(@) & ~::trunk()'` to verify.

2. Start the mock Nexus HTTP server on :12220:

   ```sh
   npx tsx tools/start_mock_api.ts &
   ```

   (MSW can't be used because bombadil's browser doesn't register service
   workers; see issues [bombadil#98](https://github.com/antithesishq/bombadil/issues/98)
   and [bombadil#105](https://github.com/antithesishq/bombadil/issues/105).)

3. Build with `API_MODE=nexus` and serve on :4174:

   ```sh
   API_MODE=nexus npm run build
   npx vite preview --port 4174 &
   ```

4. Sanity-check both ports:
   ```sh
   lsof -iTCP:4174 -sTCP:LISTEN
   lsof -iTCP:12220 -sTCP:LISTEN
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4174/projects
   ```

## Running one starting-page experiment

Template (replace `<URL>` and `<TAG>`):

```sh
rm -rf test/bombadil/output-<TAG>
node_modules/.bin/bombadil test <URL> test/bombadil/spec.ts \
  --headless \
  --output-path test/bombadil/output-<TAG> \
  --time-limit 5m \
  2>&1 | tee test/bombadil/output-<TAG>/run.log | tail -20
```

Post-run inspection:

- Violations are reported at the end of stdout ("Test finished after time limit, finding N violations!" vs. just "Test finished after time limit!").
- Trace is at `test/bombadil/output-<TAG>/trace.jsonl`. Useful jq queries:
  - URLs visited: `jq -r '.url' trace.jsonl | sort -u`
  - Routes that produced a spinner:
    `jq -r 'select(.snapshots[] | select(.name=="hasSpinner").value == true) | .url' trace.jsonl | sort -u`
  - Any error-boundary hits:
    `jq -r 'select(.snapshots[] | select(.name=="hasErrorBoundary").value == true) | .url' trace.jsonl | sort -u`
  - Toast texts seen (dedup bug detection):
    `jq -r '.snapshots[] | select(.name=="toastTexts") | .value[]' trace.jsonl | sort | uniq -c | sort -rn | head`
  - Action distribution:
    `jq -r '.action | if type == "string" then . elif . == null then "null" else (keys[0]) end' trace.jsonl | sort | uniq -c`
- Screenshots at `output-<TAG>/screenshots/*.webp` — spot-check the last few if anything looks off.

## Starting pages to try

Derived from `mock-api/` seed data and `app/util/path-builder.ts`. The
idea is to cover the main entity kinds and a few routes associated with
past bugs.

Project seeds (all in default silo, owned by user1 "Hannah Arendt"):
`mock-project`, `other-project`, `project-no-vpcs`, plus kosman/anscombe/adorno
in other silos. Most sub-resources live under `mock-project`.

| #   | Starting URL                                          | Why this page / what's interesting                                                 |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | `/projects`                                           | baseline (current default); landing surface, project list + create                 |
| 2   | `/projects/mock-project/instances`                    | rich seed data: running/failed/starting/db2 instances; lots of row actions         |
| 3   | `/projects/mock-project/instances/you-fail`           | failed instance w/ null auto_restart_policy — touches bug class from console#2820  |
| 4   | `/projects/mock-project/instances/db1/networking`     | NIC tab — touches bug class from console#3036 (dual-stack NIC crash)               |
| 5   | `/projects/mock-project/instances/db1/metrics/cpu`    | OxQL metrics — touches console#2733 (stuck loading), console#2689 (error boundary) |
| 6   | `/projects/mock-project/vpcs/mock-vpc/firewall-rules` | complex form area; rules editing; past bugs around rule rendering (console#2851)   |
| 7   | `/projects/mock-project/floating-ips`                 | IP attach/detach flows; ephemeral IP error handling is a recent area               |
| 8   | `/projects/mock-project/disks`                        | disk limit warnings (console#3038), snapshot flows (console#3071, #3068)           |
| 9   | `/projects/mock-project/affinity`                     | anti-affinity groups — touches console#3016 (blank on "fail" policy)               |
| 10  | `/projects/project-no-vpcs/vpcs`                      | empty-state rendering for a real project with no sub-resources                     |
| 11  | `/images`                                             | silo-level images list                                                             |
| 12  | `/system/networking/ip-pools`                         | fleet-scoped; auth/role boundaries (console#2774 class)                            |
| 13  | `/settings/profile`                                   | user settings; SSH keys (console#3177 touched this area)                           |
| 14  | `/projects/mock-project/instances-new`                | instance create form — big form surface, lots of field validation                  |

Feel free to add/remove based on what seems productive. Not every run has
to be 5 minutes — if nothing interesting is happening, kill it and move on.

## Record

Fill in as each run completes. Columns:

- **URL** — starting URL (abbreviated if needed)
- **Duration** — wall clock (e.g., `5m`)
- **Violations** — count + which properties
- **Routes reached** — rough sample (top N by visit count), or "stayed on start"
- **Notable** — anything worth flagging: crashes avoided, long spinners, resources created, any interesting state

| #   | URL                                         | Duration | Violations                                         | Routes reached                                                                                                                                                                                                                                             | Notable                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------- | -------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `/projects`                                 | 5m       | 0                                                  | `/projects` (79), `other-project/instances` (61), `/projects-new` (28), `other-project/disks` (21), `other-project/access` (12)                                                                                                                            | 247 trace entries; no toasts the entire run; bombadil never visited `mock-project` (stayed in `other-project`); spinners on `other-project/disks` (17) always resolved; only 10 `TypeText` actions despite `inputs` weighted 5 — forms weren't reached often enough for weight to matter. Actions: 70 Click, 65 Back, 39 Forward, 31 Reload, 27 Wait, 10 TypeText.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2   | `/projects/mock-project/instances`          | 5m       | **1** (`loadingResolves`)                          | `mock-project/instances` (65), `snapshots` (34), `images` (34), `instances/db1/storage` (28), `/projects` (16), `vpcs/mock-vpc/firewall-rules` (15), `vpcs` (15), `disks` (10), affinity (7), `instances/db1/connect` (5), `instances/db1/metrics/cpu` (4) | Spinner stuck >10s on `mock-project/instances` & `snapshots` during rapid Back/Forward/Click navigation. Spinner shows while page has rendered content (mainText non-empty "Instances… Updated 7:19 PM") — suggests a background refetch/poll keeps `isFetching` true, not initial loader. Responses all 200, no error boundaries, no toasts, no console errors surfaced. Possible test artifact from bombadil's nav tempo outrunning polling debounce; worth reproducing manually to decide. 260 trace entries. Actions: 82 Click, 70 Back, 38 Wait, 30 Reload, 29 Forward. Trace preserved at `test/bombadil/repros/instances-spinner/`.                                                                                                                                                                                                                                                                   |
| 3   | `/projects/mock-project/instances/you-fail` | 5m       | **13** (`mainContentAppears` ×1, `noNotFound` ×12) | `you-fail/storage` (89), `you-fail/metrics/cpu` (30), `/projects` (29), `mock-project/instances` (20), `/login` (12), `mock-project/access` (11), `affinity` (10), `disks` (8), `images` (6)                                                               | Two distinct issues. **(a)** Sign Out in user menu redirects to `/login` (via `navToLogin` in `app/api/nav-to-login.ts`), but SPA has no `/login` route — only `/login/:silo/local`. In prod the Nexus backend serves `/login` directly, so this is invisible; under `API_MODE=nexus` it renders Not Found → 12 `noNotFound` violations as bombadil poked around from there. Not a prod bug, but noisy: consider excluding `/login` from `noNotFound`, or adding a silo-redirect shim. Trace summary at `test/bombadil/repros/signout-login-404/`. **(b)** `mainContentAppears` fired at the very first snapshot on bare `/instances/you-fail` — main area stayed empty ~30s before the `<Navigate to="storage" replace />` index route took effect (or bombadil issued a Reload). Likely a snapshot-timing artifact from bombadil's startup, not a real user-visible hang, but flagging. 240 trace entries. |

## Pre-existing observations (30s baseline on `/projects`)

- Test completed with no violations.
- `menuSurvivesWait` was non-vacuously exercised at least once
  (menu open → Wait → menu still open).
- `noDuplicateToasts` was vacuous — no toasts fired in 30s. Mutations
  (deletes, creates) would need to happen to trigger toasts; 30s is short.
- Bombadil created at least three ad-hoc projects (`man64sj4mdvow5`,
  `yc59bgiy1nysnqp`, `in3yeqt`) via the New Project form. Good sign that
  `inputs` + `clicks` can drive creates on their own given time.

## How to stop / tear down

```sh
# Kill preview server
lsof -ti:4174 | xargs kill
# Kill mock API
lsof -ti:12220 | xargs kill
# Clean outputs
rm -rf test/bombadil/output-*
```

## Action mix

The spec uses a single `weighted(...)` action generator instead of re-exporting
each default action individually. Current weights (in `test/bombadil/spec.ts`):

| Weight | Action                                            |
| ------ | ------------------------------------------------- |
| 5      | `inputs`                                          |
| 3      | `clicks`                                          |
| 2      | `navigation`                                      |
| 1      | `scroll`, `back`, `forward`, `reload`, `waitOnce` |

Heavy weight on `inputs` because this app is forms-heavy and `inputs` yields
nothing unless a focusable input is in the DOM — so the weight only takes
effect on forms and is effectively no-op elsewhere. **If a run seems stuck
in one place or isn't reaching forms at all, tweak these weights** (e.g.,
bump `navigation` to wander more, drop `back`/`forward` to stop jumping
history, or lower `clicks` if it's abandoning forms mid-fill). Note the
weights in the record column for each run so we can correlate.

## Round 2 — tune weights based on runs 1–4

Runs 1–4 showed three compounding problems: `inputs` is a no-op away from
forms so weight 5 produced only 3–10 `TypeText` actions per run; `Back` +
`Forward` + `Reload` eat 30–45% of steps without growing coverage and cause
polling races (run 2); and low `navigation` weight traps bombadil in one
sub-section (run 1 never reached `mock-project`; run 4 spent 44% of steps
on one URL). Mutations rarely complete (no toasts) because forms get
abandoned mid-fill. Plan below rebalances weights and picks start URLs
aimed at reaching code with past bugs.

### Prereq spec changes

1. **Done.** `noNotFound` now exempts `/login` (which is backend-served in
   prod but has no SPA route). Removes the 12 noise violations run 3 hit
   after bombadil clicked "Sign out".

2. Still to do: make action weights overridable per process via env so
   parallel slots can use different mixes without copying the spec. Read
   `BOMBADIL_WEIGHTS` as JSON mapping action name → weight at module
   load; fall back to current defaults. Keys: `inputs`, `clicks`,
   `navigation`, `scroll`, `back`, `forward`, `reload`, `waitOnce`.

### Iteration strategy

Round 1 ran 5m per slot. That's too slow to learn from — weight
mistakes burn 25 minutes before you see the action histogram. Switch to
**short iterative rounds**:

- **Round 2a — 90s smoke per slot.** Goal is cheap signal on whether the
  weight profile is doing what we want: does the action distribution
  actually reflect the weights, and is bombadil moving through the code
  paths we targeted? At 90s we'll get ~40–80 trace entries per slot,
  enough to judge action mix but not enough to reliably catch violations.
  Read traces, adjust weights, re-run.
- **Round 2b — 3m per surviving slot.** Only run the profiles that
  passed the smoke (action mix looks right, bombadil reached intended
  surface). Drop or re-tune the rest. 3m still catches most liveness
  violations since both `loadingResolves` and `toastsClear` have bounds
  under 20s.
- **Round 2c — 10m on the most promising 1–2 profiles.** Long enough for
  rare races and deeper mutation chains. Only do this when 2b has
  converged on a profile worth investing in.

After each round, post an updated summary line to the record table with
the action histogram and top 3 URLs. Don't try to read the full trace
each time — the jq one-liners in "Post-run inspection" above are enough.

### Proposed round-2 matrix (5 parallel slots)

Run all five concurrently via `run-slot.sh <slot> <url> <tag>` with
different `BOMBADIL_WEIGHTS`. **90s** for 2a, **3m** for 2b, **10m** for
2c (on survivors). `run-slot.sh` takes `time_limit` as its 4th arg.

| Slot | Start URL                                                 | Weight profile                                                                          | Hypothesis / what it's probing                                                                                                                                                                                                              |
| ---- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5    | `/projects/mock-project/instances-new`                    | `{inputs:8, clicks:4, navigation:1, scroll:0, back:0, forward:0, reload:0, waitOnce:1}` | Force form completion on the biggest form surface. Zero history churn so bombadil can't abandon the form mid-fill. Should drive real creates → real toasts → exercise `noDuplicateToasts`.                                                  |
| 6    | `/projects/mock-project/instances`                        | `{inputs:2, clicks:6, navigation:2, scroll:0, back:0, forward:0, reload:0, waitOnce:4}` | Row-actions + menus page; `menuSurvivesWait` and background-polling races are the target. Eliminate Reload/Back/Forward to isolate polling-vs-nav causes for run-2-style spinner stalls. High `waitOnce` exercises the menu-close property. |
| 7    | `/projects`                                               | `{inputs:3, clicks:3, navigation:8, scroll:0, back:1, forward:0, reload:1, waitOnce:1}` | Breadth run. Heavy navigation to escape the subtree lock-in from run 1. Expect to actually reach `mock-project` and system pages. Compare URL-visit distribution vs run 1.                                                                  |
| 8    | `/projects/mock-project/vpcs/mock-vpc/firewall-rules-new` | `{inputs:8, clicks:3, navigation:0, scroll:1, back:0, forward:0, reload:0, waitOnce:1}` | Targets console#2851 class (firewall rule render bugs). `navigation:0` pins to this form; rule forms have nested repeating groups that stress validation.                                                                                   |
| 9    | `/projects/mock-project/disks`                            | `{inputs:5, clicks:5, navigation:2, scroll:1, back:0, forward:1, reload:0, waitOnce:1}` | Disk/snapshot area (console#3038, #3071, #3068). Moderate mix; `forward:1` kept only to let bombadil revisit a freshly-created disk's detail page after a create.                                                                           |

Rationale for the common patterns: **history weights ≈ 0** except where a
specific revisit flow is wanted (slot 7 keeps a little for breadth, slot 9
keeps `forward` to revisit post-create). **`inputs` ≥ `clicks`** when the
start URL is itself a form (5, 8) so fields get filled before something
clicks Cancel. **`navigation` large only when breadth is the goal** (slot 7) and zero when we want bombadil to stay on a form (5, 8). **`waitOnce`
boosted** only for slot 6 where the goal is probing polling/menu timing.

### Record (round 2)

Add a row per slot per round (2a / 2b / 2c). Include the tag so the
output directory is discoverable.

| Slot | Round | Tag | Duration | Violations | Action histogram | Top 3 URLs | Notable |
| ---- | ----- | --- | -------- | ---------- | ---------------- | ---------- | ------- |
|      |       |     |          |            |                  |            |         |

### Running round 2a (90s smoke)

```sh
# Build once (API_MODE=nexus npm run build) before kicking off slots.
# Then, in parallel:

BOMBADIL_WEIGHTS='{"inputs":8,"clicks":4,"navigation":1,"scroll":0,"back":0,"forward":0,"reload":0,"waitOnce":1}' \
  test/bombadil/run-slot.sh 5 /projects/mock-project/instances-new 2a-05-instances-new 90s &

BOMBADIL_WEIGHTS='{"inputs":2,"clicks":6,"navigation":2,"scroll":0,"back":0,"forward":0,"reload":0,"waitOnce":4}' \
  test/bombadil/run-slot.sh 6 /projects/mock-project/instances 2a-06-instances-menus 90s &

BOMBADIL_WEIGHTS='{"inputs":3,"clicks":3,"navigation":8,"scroll":0,"back":1,"forward":0,"reload":1,"waitOnce":1}' \
  test/bombadil/run-slot.sh 7 /projects 2a-07-breadth 90s &

BOMBADIL_WEIGHTS='{"inputs":8,"clicks":3,"navigation":0,"scroll":1,"back":0,"forward":0,"reload":0,"waitOnce":1}' \
  test/bombadil/run-slot.sh 8 /projects/mock-project/vpcs/mock-vpc/firewall-rules-new 2a-08-fw-rules 90s &

BOMBADIL_WEIGHTS='{"inputs":5,"clicks":5,"navigation":2,"scroll":1,"back":0,"forward":1,"reload":0,"waitOnce":1}' \
  test/bombadil/run-slot.sh 9 /projects/mock-project/disks 2a-09-disks 90s &

wait
```

### 2a decision gates (what to look for before promoting to 2b)

For each slot, check from `trace.jsonl`:

- **Action mix matches intent.** E.g. slot 5 should be majority
  `TypeText` + `Click`; slot 7 should show broad URL coverage.
- **Intended surface reached.** Slots 5/8 should stay on their form
  (URL count on start path ≥ half of entries). Slot 7 should hit ≥ 3
  distinct project subtrees.
- **No trivial immediate failure.** A slot that 404s or error-boundaries
  at step 1 means the start URL or build is wrong — fix before promoting.

If a profile fails a gate, retune (usually: bump the under-represented
action's weight by +2, drop the over-represented one by 1) and re-run
just that slot at 90s before including it in 2b.

### 2b / 2c success criteria

- At least one run produces real mutation toasts (confirms `inputs`
  boost is reaching submission, not just typing into fields).
- Slot 7's URL distribution includes `mock-project/*` routes (confirms
  navigation-weight hypothesis).
- No recurrence of `/login` `noNotFound` violations (confirms spec fix).
- The run-2 spinner artifact does not recur in slot 6 despite heavy
  clicks — would suggest the stall really was about rapid history
  navigation outrunning polling.
- Any new violation class surfaced that wasn't in runs 1–4.

## Open questions / follow-ups

- For 5m+ runs, consider using `bombadil inspect <output-path>` to visually
  review the trace (opens a local web UI).
- If a single run finds a violation, copy the trace to a stable location
  (`test/bombadil/repros/<issue>/`) before the next run clobbers it.
- If bombadil keeps getting stuck on one form (e.g., can't satisfy name
  validation), consider writing a custom `ActionGenerator` for that form
  with structured `TypeText` sequences. Not needed up front.
