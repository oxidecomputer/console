# Vitest browser candidates inside the Playwright suite

Date: 2026-07-10

## Goal

Inventory interaction sequences inside existing Playwright E2E tests that primarily exercise reusable UI behavior and would be clearer or faster as Vitest browser tests. Classify at the assertion/sequence level rather than assuming an entire E2E file must move together.

## Classification criteria

A sequence is a strong browser-test candidate when most of its setup exists only to reach one component state, its assertions concern local UI behavior, and route/API/session behavior is incidental. Retain Playwright coverage for representative wiring, persistence, authorization, navigation, loaders, and backend state transitions.

## Working inventory

The Chrome project currently lists 344 tests across 52 files. The useful migration unit is usually a sequence within a test, not the file: a successful mutation can remain E2E while its conditional fields, validation matrix, and dialog keyboard behavior move to a direct browser test.

## Browser matrix

Vitest's Playwright provider accepts multiple `browser.instances`, including Chromium, Firefox, and WebKit. Vitest shares one Vite server and dependency cache between the instances. See the [Vitest multiple setups documentation](https://vitest.dev/guide/browser/multiple-setups.html).

Run all browser specs in all three engines. That preserves the cross-browser property of the Playwright suite and is currently cheap: the expanded 19-test suite takes 4.41 seconds wall-clock for all 57 browser/engine combinations. Instances run concurrently, so the cost is not 3×. The first matrix run also exposed click-only setup in a Combobox test that was unreliable in Firefox under concurrent load; removing the redundant setup interaction made the suite portable.

## Tier 1: extract first

These cases have little reason to pay for a complete route, seeded mock API, login, and page navigation.

| E2E source                                        | Move to browser tests                                                                                                                    | Keep in Playwright                                                               | Notes                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `combobox.e2e.ts`                                 | Committed versus edited value, clear, arbitrary values, highlighted Enter behavior, Escape containment, image labels, and virtualization | One representative submitted payload and one parent-form/modal wiring case       | Eight direct tests now cover the component behavior. Most of this file reaches unrelated forms only to exercise `Combobox`.                 |
| `docs-popover.e2e.ts`                             | Open/close, content and links, Escape/focus restoration, outside click                                                                   | At most one page-level check that the expected docs are wired to a page          | Already covered directly.                                                                                                                   |
| `row-select.e2e.ts`                               | Cell selection, header select-all/clear, indeterminate state                                                                             | Nothing unless a real product page later exposes selection-specific integration  | The E2E case is skipped and explicitly points toward Testing Library; direct table tests now cover it.                                      |
| `action-menu.e2e.ts`                              | Form-safe Enter, arrow navigation, search, selected-item action, Escape/reset, and item grouping/order                                   | Breadcrumb-derived “Go up” and the route/permission/resource-state registrations | Mount `ActionMenu` with a `MemoryRouter` and explicit items.                                                                                |
| `nav-guard-modal.e2e.ts`                          | Pristine dismiss, dirty dismiss confirmation, Keep editing, Leave form, Escape, and focus behavior                                       | One navigation integration check if desired                                      | The Floating IP page is incidental setup for generic `SideModalForm` behavior.                                                              |
| `instance-metrics.e2e.ts`                         | Custom date range, invalid range, preset selection, keyboard dismissal                                                                   | Metrics tab navigation, API loading/empty/error states, chart refetch            | Add the two remaining cases to the existing `DateTimeRangePicker` browser spec.                                                             |
| `dates.e2e.ts`; locale cases in `ip-pools.e2e.ts` | English/German/French date output and localized large-number output                                                                      | No full-page locale test unless locale wiring itself has regressed               | Use locale-specific browser instances or an explicit locale harness. Engine matrix remains three browsers; locale instances are orthogonal. |
| `project-create.e2e.ts`                           | Expected fields, client validation, scrim dismiss, known mutation-error rendering/reset                                                  | One successful create/navigation and representative server error                 | A direct form test can mock the mutation boundary without an app page.                                                                      |
| `silos.e2e.ts` (`form scrolls...`)                | Generic ObjectAlreadyExists-to-name-field focus/scroll behavior                                                                          | Silo-specific server error mapping                                               | Better placed on the shared form shell in a constrained viewport.                                                                           |
| `pagination.e2e.ts`                               | Previous/next disabled state, uncached spinner, cached navigation, row counts, and scroll reset                                          | A small query-table route wiring check, if any                                   | Use `useQueryTable` with a seeded query client and controllable deferred queries.                                                           |
| `instance.e2e.ts` (polling/menu sequences)        | Open row actions, rerender/poll new row data, assert menu remains open                                                                   | One real polling integration case                                                | Repeat across direct table/action-column variants rather than five full pages.                                                              |

## Tier 2: form-state clusters

These are valuable browser tests, but some require a query-client/router harness or a small extraction from a large form.

| E2E source                                              | Move to browser tests                                                                                                                                                                                      | Keep in Playwright                                                                                   | Prerequisite                                                                                                                            |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `firewall-rules.e2e.ts`                                 | Targets table, target and host validation, hosts table, ICMPv4/v6 filter switching, add/remove rows, overflow tooltip/layout                                                                               | Representative create/update/clone payloads, direct URL/404, conflicts                               | Mount the common rule editor with form context; mount the cell renderer separately for overflow.                                        |
| `external-subnets.e2e.ts`                               | Explicit CIDR validation, IPv4/IPv6 prefix clamp, auto/explicit field switching, resolved-name rendering                                                                                                   | Create/update/delete, attach/detach, direct route                                                    | Seed pool/instance queries.                                                                                                             |
| `subnet-pools.e2e.ts`                                   | Cross-field prefix validation and pool-picker filtering                                                                                                                                                    | Member mutation and link/default persistence                                                         | Existing pure validation tests remain useful; browser test covers RHF wiring.                                                           |
| `ip-pools.e2e.ts`                                       | Range validation/add/remove UI, IPv4-in-v6 and IPv6-in-v4 rejection, count/error clearing                                                                                                                  | Successful mutation, capacity/utilization persistence, silo links/defaults                           | Mount range form with pool version/data.                                                                                                |
| `disks.e2e.ts`                                          | Blank/snapshot/image/local source switching, size clamp, source minimum size, read-only state                                                                                                              | A representative create per API shape and resulting resource                                         | Seed image/snapshot queries or pass explicit options after a small extraction.                                                          |
| `instance-create.e2e.ts`                                | Hardware presets/custom validation; boot-disk size/name/source state; additional-disk filtering/table; floating-IP add/remove/empty state; NIC/IP-version/ephemeral-IP dependencies; no-VPC disabled state | Representative successful creates and resulting network/storage payloads; server/default-pool errors | Highest payoff but largest harness. Prefer extracting form sections over mounting the whole route for every matrix case.                |
| `ip-pool-silo-config.e2e.ts`                            | Default/missing/no-pool form initialization and blocked-submit states                                                                                                                                      | Successful instance/IP attachment and actual silo-default integration                                | Reuse the Instance Create and Floating IP form harnesses.                                                                               |
| `instance-networking.e2e.ts`                            | Ephemeral-IP option filtering by NIC version, attach-dialog disabled/error state, Transit IP local validation/editor                                                                                       | Representative attach/detach/update mutation                                                         | Seed instance/NIC/IP data.                                                                                                              |
| `image-upload.e2e.ts`                                   | Form/block-size validation; progress-step rendering; cancel at each state; cancel-canceling; retry; failure-to-message mapping; nested scrim behavior                                                      | One real streaming upload, cleanup/persistence after cancel, one server failure                      | Make the upload state machine or transport injectable. The nested modal test should run in WebKit too rather than remain skipped there. |
| `instance-disks.e2e.ts` (`Attach disk error clears...`) | Mutation error resets when the modal closes/reopens                                                                                                                                                        | One sentinel-backed attach failure                                                                   | Directly tests the documented modal mutation-reset contract.                                                                            |

## Tier 3: targeted component matrices

- `instance-auto-restart.e2e.ts`: move the policy/state/time-dependent popover content matrix to a direct test with fixed time and route params. Keep policy mutation, settings navigation, and persistence E2E.
- `theme.e2e.ts`: move the picker, persisted preference, `matchMedia` response, and forced-dark hook/component behavior. Keep pre-hydration `theme-init.js` and serial-terminal color integration E2E because their value is document/application lifecycle integration.
- `system-update.e2e.ts`: confirmation/warning content for release-state combinations can be a direct modal test; retain role gates, update workflow, backend transitions, and persistence.
- `utilization.e2e.ts`: move zero-over-zero and number presentation to formatter/component tests. Keep role visibility, resource data, and copy/page wiring E2E.
- Tooltip and copy-button assertions embedded in `fleet-access.e2e.ts`, `inventory.e2e.ts`, and resource tables should usually become one direct test of the shared renderer rather than repeated page-specific E2Es. Keep assertions that a page supplies the correct value.

## Keep primarily E2E

The remaining files principally test routing, authorization, authentication, loader/error-boundary behavior, API mutations and persistence, browser history/scroll restoration, CSP/application boot, or terminal integration. They should not be migrated merely because direct browser mounting is possible:

- routing and shell: `breadcrumbs`, `click-everything`, `lookup-routes`, `meta`, `scroll-restore`, `error-pages`, `z-index`
- authentication and authorization: `authz`, `login`, `login-saml`, access/role suites
- resource workflows: `access-tokens`, `anti-affinity`, floating IP create/update, images, inventory, networking, network-interface create, project/silo access, SCIM tokens, snapshots, SSH keys, VPCs
- terminal and application lifecycle: `instance-serial`, pre-hydration theme tests

Those files can still shed small validation or reusable-widget sequences when encountered, but their central assertions need the assembled application and mock backend.

## Recommended extraction order

1. Finish direct coverage for Combobox, ActionMenu, SideModalForm/nav guard, DateTimeRangePicker, locale formatting, and row selection; remove the corresponding redundant or skipped E2E sequences.
2. Extract the repeated firewall, external-subnet, IP/subnet-pool, and disk form-state matrices.
3. Build reusable browser harnesses for QueryClient + MemoryRouter + form mutations, then tackle Instance Create and Instance Networking.
4. Make image upload state injectable and move its long UI state matrix, retaining a small E2E transport/persistence set.

This order proves the deletion side of the migration early. Adding browser tests without deleting the route-heavy duplicates would improve diagnostics but not CI time.
