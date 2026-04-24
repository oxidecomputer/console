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

2. **Done.** Named weight profiles, one spec file per profile. Bombadil
   runs specs in embedded V8 (no Node, no `process.env`) so env-var
   selection doesn't work; instead each profile gets a tiny spec file
   (`spec-form-heavy.ts`, `spec-menus.ts`, etc.) that imports from
   `profiles.ts` (weights + factory) and `spec-shared.ts` (extractors +
   properties). Current profiles: `balanced` (default), `form-heavy`,
   `form-pinned`, `menus`, `breadth`, `create-and-revisit`. Add new
   profiles by editing `profiles.ts` and creating a matching
   `spec-<name>.ts`. Exports must be typed as
   `ActionGenerator | Formula` — bombadil rejects unknown-typed exports
   via `export *`, so only the properties+`defaultActions` live in
   per-profile specs, and they must use the **export name
   `defaultActions`** (not `actionMix`) for bombadil to pick them up.

### Gotcha: `navigation` is a history composite, not URL navigation

Bombadil's built-in `navigation` action is **internally** `weighted([[10, back], [1, forward], [1, reload]])` — it's a history-churn composite,
not a "navigate to new URL" action. Actual URL navigation happens through
`clicks` (sidebar links, breadcrumbs, row links). Practical consequences:

- Profiles with `navigation > 0` produce Back/Forward/Reload even when
  `back`, `forward`, and `reload` are listed as weight 0 directly.
- To truly pin bombadil to a page (no history churn), set
  `navigation: 0`. Even then, `clicks` can click a sidebar link and
  leave the page.
- To bias toward breadth (discovering new routes), boost `clicks`, not
  `navigation`. `navigation` just replays the history you already have.

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

Run all five concurrently via `run-slot.sh <slot> <url> <tag> <time>` with
`BOMBADIL_PROFILE=<name>` set per slot. **90s** for 2a, **3m** for 2b,
**10m** for 2c (on survivors).

| Slot | Start URL                                                 | Profile              | Hypothesis / what it's probing                                                                                                                                                                                                              |
| ---- | --------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5    | `/projects/mock-project/instances-new`                    | `form-heavy`         | Force form completion on the biggest form surface. Zero history churn so bombadil can't abandon the form mid-fill. Should drive real creates → real toasts → exercise `noDuplicateToasts`.                                                  |
| 6    | `/projects/mock-project/instances`                        | `menus`              | Row-actions + menus page; `menuSurvivesWait` and background-polling races are the target. Eliminate Reload/Back/Forward to isolate polling-vs-nav causes for run-2-style spinner stalls. High `waitOnce` exercises the menu-close property. |
| 7    | `/projects`                                               | `breadth`            | Heavy navigation to escape the subtree lock-in from run 1. Expect to actually reach `mock-project` and system pages. Compare URL-visit distribution vs run 1.                                                                               |
| 8    | `/projects/mock-project/vpcs/mock-vpc/firewall-rules-new` | `form-pinned`        | Targets console#2851 class (firewall rule render bugs). `navigation:0` pins to this form; rule forms have nested repeating groups that stress validation.                                                                                   |
| 9    | `/projects/mock-project/disks`                            | `create-and-revisit` | Disk/snapshot area (console#3038, #3071, #3068). Moderate mix; a little `forward` so bombadil revisits a freshly-created disk's detail page after a create.                                                                                 |

Rationale for the profile designs: **history weights ≈ 0** except where a
specific revisit flow is wanted (`breadth` keeps a little, `create-and-revisit`
keeps `forward`). **`inputs` ≥ `clicks`** when the start URL is itself a form
(`form-heavy`, `form-pinned`) so fields get filled before something clicks
Cancel. **`navigation` large only when breadth is the goal** and zero when we
want to stay on a form. **`waitOnce` boosted** only for `menus` where the goal
is probing polling/menu timing.

### Record (round 2)

| Slot | Round | Profile                       | Duration | Violations                | Action histogram                                                 | Top 3 URLs                                                                                                                             | Notable                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---- | ----- | ----------------------------- | -------- | ------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5    | 2a    | form-heavy                    | 90s      | 0                         | Click 59, Back 19, Wait 11, TypeText 5, Reload 2 (n=99)          | `/projects` (17), `/mock-project/disks` (14), `/other-project/external-subnets-new` (12)                                               | Only 10/99 on start URL; `navigation:1` leaked Back (19) so profile failed its "zero history churn" intent.                                                                                                                                                                                                                                                                                                                                                                 |
| 6    | 2a    | menus                         | 90s      | 0                         | Click 75, Wait 30, Back 12, Reload 2 (n=121)                     | `/projects` (29), `/access` (15), `/other-project/disks` (14)                                                                          | Left instances page almost immediately. `navigation:2` leaked 12 Back. 30 Wait good for menuSurvivesWait but didn't trigger it because menus rarely opened.                                                                                                                                                                                                                                                                                                                 |
| 7    | 2a    | breadth                       | 90s      | 0                         | Back 21, Forward 16, Reload 13, Click 9, Wait 7 (n=67)           | `/projects` (41), `/images` (17), `/mock-project/instances` (6)                                                                        | Did escape the other-project subtree lock-in (hit mock-project/instances, images). But 50/67 actions were history churn from `navigation:8` — breadth didn't materialize. Fewest entries of any slot.                                                                                                                                                                                                                                                                       |
| 8    | 2a    | form-pinned                   | 90s      | 0                         | Click 93, Wait 23, TypeText 19, ScrollDown 4, PressKey 3 (n=144) | `/project-no-vpcs/disks-new` (30), `/mock-project/vpcs/mock-vpc/firewall-rules-new` (23), `/project-no-vpcs/external-subnets-new` (12) | Best TypeText rate (13%) of the round. 0 Back/Forward/Reload confirmed `navigation:0` works. But clicks on sidebar links still carried bombadil off to disks-new and external-subnets-new — couldn't fully pin.                                                                                                                                                                                                                                                             |
| 9    | 2a    | create-and-revisit            | 90s      | 0                         | Click 44, Back 20, Wait 15, ScrollDown 6, Forward 4 (n=91)       | `/mock-project/disks` (28), `/projects` (11), `/utilization` (8)                                                                       | Visited `disks/disk-10` 7× (revisit signal good). Zero TypeText — no create attempted. Disk list has few inputs, so `inputs` sat empty most of the run.                                                                                                                                                                                                                                                                                                                     |
| 5    | 2b    | form-heavy (nav=0)            | 3m       | —                         | n=14 (HUNG)                                                      | stuck on `/instances-new` and `/affinity-new`                                                                                          | Bombadil froze after "Clicking mock-project" at t=29s; only 14 trace entries in 15m wall-clock. Browser-driver issue (WS errors), not an app bug — same pattern of `screenshot timed out` seen in run 4. Killed manually (exit 143). Retry with `--no-sandbox` or narrower start URL.                                                                                                                                                                                       |
| 6    | 2b    | menus (nav=0)                 | 3m       | 0                         | Click 199, Wait 87, TypeText 3 (n=290)                           | `/projects` (95), `/mock-project/instances` (32), `/images` (15)                                                                       | Stayed closer to intended surface but still leaked to `/projects` via sidebar clicks. **8 mutation toasts** ("Project llskgv created") — first real creates in any run. 87 Wait didn't trip `menuSurvivesWait`; need instance row menus opened.                                                                                                                                                                                                                             |
| 7    | 2b    | breadth (clicks=10)           | 3m       | 0                         | Click 265, Wait 22, TypeText 1 (n=289)                           | `/utilization` (64), `/projects` (44), `/images` (29)                                                                                  | Reworked profile delivered. Broad spread: utilization, projects, images, other-project/disks, mock-project/floating-ips all in top 5. `clicks:10` drove real navigation; Back/Forward/Reload all zero. No toasts — no mutations, which is expected for breadth.                                                                                                                                                                                                             |
| 8    | 2b    | form-pinned                   | 3m       | **5** (`loadingResolves`) | Click 207, Wait 41, TypeText 11, ScrollDown 8 (n=271)            | `/images` (128), `/mock-project/vpcs/mock-vpc/firewall-rules-new` (34), `/mock-project/snapshots` (19)                                 | **Real bug candidate.** Spinner on `/mock-project/snapshots` stayed up ~14s across 17+ Click/Scroll/TypeText actions (all HTTP 200), then persisted into `/mock-project/instances` after nav. All antecedent snapshots share one `start` timestamp → single stuck-spinner event, not five. **Multiple successful mutations**: 11× "Image snapshot-max-size(qix) created", 9× "Firewall rule y created". Trace preserved at `test/bombadil/repros/snapshots-spinner-stuck/`. |
| 9    | 2b    | create-and-revisit (inputs=8) | 3m       | —                         | n=52 (CRASHED)                                                   | `/mock-project/disks-new` (52)                                                                                                         | Bombadil crashed with "browser failed to terminate" (exit 101) 52 steps in. But while it ran: 12 TypeText in 52 entries (23%) — highest rate yet, confirming the `-new` URL + `inputs:8` works. Retry with shorter time-limit or different start URL.                                                                                                                                                                                                                       |

**Round 2a verdict:** all clean, no violations, `/login` fix held. But no toasts (no mutations completed) in any slot, so `toastsClear`/`noDuplicateToasts` are still vacuous. Main learning: `navigation` is history churn, not URL nav — rework profiles before 2b.

**Round 2b verdict:** profile reworks delivered. Three of five slots ran clean with healthy action distributions (menus, breadth, form-pinned). Two infrastructure-level failures (form-heavy hung, create-and-revisit crashed) — both bombadil/browser-driver issues, not app bugs, and both retryable. Real mutations completed in menus and form-pinned (20 toasts total), finally exercising the toast-related properties non-vacuously. **form-pinned found what looked like a real candidate bug**: a spinner on `/projects/mock-project/snapshots` stayed visible for ~14s across 17+ interactions (all API calls returned 200), persisting into the next page after nav. Investigation (see [notes-snapshots-spinner.md](./notes-snapshots-spinner.md)) concluded it's a false positive: `hasSpinner` matches state-badge transition indicators (creating snapshots, starting instances) as well as real loading spinners, and the mock API never transitions those states. Trace preserved at `test/bombadil/repros/snapshots-spinner-stuck/`; proposed spec fix is to scope the selector to exclude `.spinner-sm`.

Next steps: (a) reproduce the snapshots-page spinner manually to confirm it's an app bug not a bombadil timing artifact. (b) retry slots 5 and 9 in isolation (maybe headed so we can see what bombadil's doing when it hangs). (c) 2c on form-pinned at 10m is a clear "do it": it's the profile that's finding real signal and mutations are reaching submission.

### Round 2b — adjustments

Before running 2b, fix the profiles based on 2a findings:

- **form-heavy**: set `navigation: 0` (currently 1). The profile's intent is "no history churn"; `navigation:1` leaked 19 Back in 99 entries. Match form-pinned's zero-nav setting but keep `clicks:4` so bombadil can click into fields.
- **menus**: set `navigation: 0` (currently 2). Purpose is probing menu polling races; wandering off the page defeats that.
- **breadth**: swap `navigation:8` for `clicks:8`. `clicks` is what drives real URL navigation (sidebar, links). Drop `back`/`reload` to 0 too since they just replay.
- **form-pinned**: keep as-is. Winner of 2a. The sidebar-leak is intrinsic to the app layout and clicks can't be filtered without a custom generator.
- **create-and-revisit**: bump `inputs:5 → 8` and consider starting on `/disks-new` instead of `/disks` so bombadil lands on a form with inputs ready; otherwise `inputs` remains empty most of the run.

Re-run 2b at **3m** per slot to give forms time to submit and mutations time to complete. A successful 2b should show ≥1 toast somewhere.

### Running round 2a (90s smoke)

```sh
# Build once (API_MODE=nexus npm run build) before kicking off slots.
# Then, in parallel:

test/bombadil/run-slot.sh 5 /projects/mock-project/instances-new 2a-05-form-heavy 90s test/bombadil/spec-form-heavy.ts &
test/bombadil/run-slot.sh 6 /projects/mock-project/instances 2a-06-menus 90s test/bombadil/spec-menus.ts &
test/bombadil/run-slot.sh 7 /projects 2a-07-breadth 90s test/bombadil/spec-breadth.ts &
test/bombadil/run-slot.sh 8 /projects/mock-project/vpcs/mock-vpc/firewall-rules-new 2a-08-form-pinned 90s test/bombadil/spec-form-pinned.ts &
test/bombadil/run-slot.sh 9 /projects/mock-project/disks 2a-09-create-revisit 90s test/bombadil/spec-create-and-revisit.ts &
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
