---
name: debug-e2e
description: Debug flaky Playwright E2E test failures from CI
---

# Debugging Flaky E2E Test Failures

Use this skill when investigating flaky Playwright E2E test failures from CI.

## Workflow

### 1. Get CI failure details

```bash
# View PR checks status
gh pr checks <PR_NUMBER>

# Get failed test logs
gh run view <RUN_ID> --log-failed 2>&1 | head -500

# Search for specific failure patterns
gh run view <RUN_ID> --log-failed 2>&1 | rg -C 30 "FAILED|Error:|Expected|Timed out"
```

### 2. Reproduce locally with repeat-each

Run the failing test multiple times to reproduce flaky behavior:

```bash
# Run specific test 20 times
npm run e2e -- test/e2e/<file>.e2e.ts --repeat-each=20 -g "<test name pattern>"

# Target specific browser if failure is browser-specific
npm run e2e -- test/e2e/<file>.e2e.ts --repeat-each=20 -g "<test name>" --project=<browser>
```

### 2.1 Calibrate test duration

Start small to get signal quickly, then scale up only if needed.

- 5-10 repeats on a single browser is usually under a few minutes.
- 20+ repeats across all browsers can take a long time, especially for full files.

Always run repeats on a single test or at most one file. Never repeat the whole suite.
Prefer narrowing with `-g` and `--project` first, then increase `--repeat-each` once the fix looks stable.

### 3. Analyze failure artifacts

When tests fail, Playwright saves traces and error context:

```bash
# View error context (page snapshot at failure time)
cat test-results/<test-name>-<browser>/error-context.md

# Open trace viewer (interactive)
npx playwright show-trace test-results/<test-name>-<browser>/trace.zip
```

### 4. Common flakiness patterns

**React Aria NumberInput flakiness**: When `fill()` on a NumberInput doesn't stick, it's often because:

- The component re-renders after a prop change (e.g., `maxValue` changing)
- Hydration race conditions

**Fix pattern - NumberInput helper**:

```typescript
import { fillNumberInput } from './utils'

await fillNumberInput(input, 'value')
```

**Form hydration issues**: Wait for a field that only renders after mount:

```typescript
await expect(page.getByRole('radiogroup', { name: 'Block size' })).toBeVisible()
```

**State change timing**: When clicking changes form state, wait for visual confirmation:

```typescript
await page.getByRole('radio', { name: 'Local' }).click()
// Wait for dependent UI to update
await expect(page.getByRole('radiogroup', { name: 'Block size' })).toBeHidden()
```

### 5. Sleep as last resort

If deterministic waits don't work, use `sleep()` from `test/e2e/utils.ts`:

```typescript
import { sleep } from './utils'

await sleep(200) // Use sparingly, prefer deterministic waits
```

### 6. Verify fix is stable

Run at least 30-50 iterations to confirm flakiness is resolved:

```bash
npm run e2e -- test/e2e/<file>.e2e.ts --repeat-each=50 -g "<test name>"
```

A good target is 0 failures out of 100+ runs. Test on all browsers that failed in CI.
