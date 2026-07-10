# Vitest browser extraction inventory

Date: 2026-07-10

## Plan

1. [x] Enumerate all 344 Chrome Playwright tests across 52 files and identify component-like interaction sequences.
2. [x] Inspect the strongest candidates and the reusable component/form each exercises.
3. [x] Classify candidates by payoff and name the Playwright coverage to retain.
4. [x] Identify prerequisite refactors or harness/provider needs.
5. [x] Verify the browser matrix: run every browser spec in Chromium, Firefox, and WebKit.

## Recommended implementation slices

1. Complete ActionMenu, SideModalForm/nav guard, DateTimeRangePicker, locale-formatting, and row-selection coverage; delete replaced E2E sequences. Combobox component coverage is complete.
2. Move local state/validation matrices for firewall rules, external subnets, IP/subnet pools, and disk creation.
3. Add a shared QueryClient + MemoryRouter + mutation browser harness and use it for Instance Create/Networking state matrices.
4. Inject image-upload stages/transport so the progress, cancellation, retry, and error UI can be tested directly while keeping a few transport/persistence E2Es.

All browser tests should run in Chromium, Firefox, and WebKit. The current 19-test suite completes 57 browser/engine cases in 4.41 seconds. The six closest Chromium E2E cases for the new ActionMenu and DateTimeRangePicker coverage take 6.20 seconds by themselves.
