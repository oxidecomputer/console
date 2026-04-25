#!/usr/bin/env bash
# Resolve a named Bombadil scenario from scenarios.json and run it in an
# isolated slot via run-slot.sh.
#
# Usage: run-scenario.sh <slot> <scenario> [time_limit]
set -euo pipefail

slot="${1:?slot required}"
scenario="${2:?scenario required}"
time_limit_override="${3:-}"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$repo_root"

config_path="test/bombadil/scenarios.json"

if ! jq --exit-status --arg scenario "$scenario" '.[$scenario]' "$config_path" >/dev/null; then
  echo "Unknown Bombadil scenario '$scenario'. Available scenarios:" >&2
  jq --raw-output 'keys[]' "$config_path" >&2
  exit 1
fi

start_path="$(jq --raw-output --arg scenario "$scenario" '.[$scenario].startPath' "$config_path")"
spec_path="$(jq --raw-output --arg scenario "$scenario" '.[$scenario].specPath' "$config_path")"
time_limit="$(
  jq --raw-output --arg scenario "$scenario" '.[$scenario].timeLimit // "5m"' "$config_path"
)"
mock_api_scenario="$(
  jq --raw-output --arg scenario "$scenario" '.[$scenario].mockApiScenario // ""' "$config_path"
)"
mock_api_user="$(
  jq --raw-output --arg scenario "$scenario" '.[$scenario].user // ""' "$config_path"
)"

if [[ -n "$time_limit_override" ]]; then
  time_limit="$time_limit_override"
fi

MOCK_API_SCENARIO="$mock_api_scenario" \
  MOCK_API_USER="$mock_api_user" \
  test/bombadil/run-slot.sh "$slot" "$start_path" "$scenario" "$time_limit" "$spec_path"
