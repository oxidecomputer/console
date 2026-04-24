#!/usr/bin/env bash
# Run a single bombadil experiment in an isolated port slot. Each slot gets its
# own mock-api (12220+slot) and its own vite preview (4174+slot), so multiple
# slots can run in parallel without sharing state.
#
# Usage: run-slot.sh <slot> <start_path> <output_tag> [time_limit] [spec_path]
#   slot:        integer >=1
#   start_path:  path under the preview origin, e.g. "/projects"
#   output_tag:  suffix for test/bombadil/output-<tag>
#   time_limit:  bombadil --time-limit (default 5m)
#   spec_path:   path to spec file (default test/bombadil/spec.ts)
#
# Expects: API_MODE=nexus npm run build has already produced dist/
set -euo pipefail

slot="${1:?slot required}"
start_path="${2:?start_path required}"
tag="${3:?output_tag required}"
time_limit="${4:-5m}"
spec_path="${5:-test/bombadil/spec.ts}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$repo_root"

mock_port=$((12220 + slot))
preview_port=$((4174 + slot))
output_dir="test/bombadil/output-${tag}"
mock_log="${output_dir}/mock-api.log"
preview_log="${output_dir}/preview.log"

mkdir -p "$output_dir"
: > "$mock_log" "$preview_log"

cleanup() {
  set +e
  [[ -n "${bombadil_pid:-}" ]] && kill "$bombadil_pid" 2>/dev/null
  [[ -n "${preview_pid:-}" ]] && kill "$preview_pid" 2>/dev/null
  [[ -n "${mock_pid:-}" ]] && kill "$mock_pid" 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

npx tsx tools/start_mock_api.ts "$mock_port" > "$mock_log" 2>&1 &
mock_pid=$!

MOCK_API_PORT="$mock_port" npx vite preview --port "$preview_port" > "$preview_log" 2>&1 &
preview_pid=$!

# Wait for both ports to accept connections
for _ in $(seq 1 50); do
  if nc -z localhost "$mock_port" 2>/dev/null && nc -z localhost "$preview_port" 2>/dev/null; then
    break
  fi
  sleep 0.2
done

if ! nc -z localhost "$mock_port" || ! nc -z localhost "$preview_port"; then
  echo "slot $slot: servers did not come up (mock $mock_port, preview $preview_port)" >&2
  exit 1
fi

node_modules/.bin/bombadil test \
  "http://localhost:${preview_port}${start_path}" \
  "$spec_path" \
  --headless \
  --output-path "$output_dir" \
  --time-limit "$time_limit" \
  > "${output_dir}/run.log" 2>&1 &
bombadil_pid=$!

# Bombadil returns 0 on clean finish, 2 on violations; both are "completed".
set +e
wait "$bombadil_pid"
bombadil_exit=$?
set -e

echo "slot $slot (${tag}): bombadil exit=$bombadil_exit"
exit "$bombadil_exit"
