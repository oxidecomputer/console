# Visual Regression Testing

## Quick Start

### 1. Generate Baseline Snapshots

First, generate baseline snapshots from some other revision:

```bash
# From main (most common)
npm run visual:baseline

# Or from a specific commit hash
npm run visual:baseline -- abc123

# Or from the previous commit
npm run visual:baseline -- HEAD~1
```

This will check out that revision in a git worktree in a temp dir, run the
visual snapshot tests, and copy the snapshots back into your current working
directory.

Note that this command does not fetch anything from the remote repo; it uses
whatever you have locally. If you want to make sure you have the latest `main`,
you need to pull it first.

### 2. Compare Current Changes

After making your changes, compare the current state against the baseline:

```bash
# Run visual comparison
npm run visual:compare

# Open UI mode to inspect differences interactively
npm run visual:compare -- --ui

# Run in headed mode (show browser)
npm run visual:compare -- --headed
```

This will run your E2E tests and flag any visual differences.

### 3. Review Differences

If differences are detected:

1. Check the `test-results/` directory for diff images
2. Use `--ui` mode to inspect differences interactively:
   ```bash
   npm run visual:compare -- --ui
   ```
3. Evaluate whether the changes are:
   - **Intentional**: Expected visual changes from your work
   - **Unintentional**: Regressions or unexpected side effects

### 4. Update Baseline (if needed)

If the visual changes are intentional and correct:

```bash
npm run visual:compare -- --update-snapshots
```

This will update the baseline snapshots to match the current state.
