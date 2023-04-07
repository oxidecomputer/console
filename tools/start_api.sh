#!/bin/bash

set -o errexit
set -o pipefail

# this script assumes it's being run from inside the omicron repo and the console
# repo shares the same parent directory

read -r -d '' UTILS <<'EOF' || true
wait_for_up() {
  while ! echo exit | nc localhost "$1"; do sleep 0.1; done
}
set_pane_title() {
  printf '\033]2;%s\033\\' "$1"
}
EOF

run_in_pane() {
  tmux send-keys -t omicron-console:0."$1" "$2" C-m
}

tmux new -d -s omicron-console
tmux set -t omicron-console pane-border-status top
tmux set -t omicron-console pane-border-style "bg=#BBBBBB fg=black"
tmux set -t omicron-console pane-active-border-style "bg=green fg=black"

tmux split-window
tmux resize-pane -t omicron-console:0.0 -y 20%

run_in_pane 0 "$UTILS"
run_in_pane 0 "set_pane_title omicron-dev"
run_in_pane 0 "SKIP_ASIC_CONFIG=1 cargo run --bin=omicron-dev -- run-all"

run_in_pane 1 "$UTILS"
run_in_pane 1 "set_pane_title 'seed data'"
run_in_pane 1 "wait_for_up 12220" # nexus
run_in_pane 1 "export OXIDE_HOST='http://127.0.0.1:12220'"
run_in_pane 1 "export OXIDE_TOKEN='oxide-spoof-001de000-05e4-4000-8000-000000004007'"
run_in_pane 1 "../console/tools/populate_omicron_data.sh"

tmux attach -t omicron-console
