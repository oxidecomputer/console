#!/bin/bash

# this script assumes it's being run from inside the omicron repo and the console
# repo shares the same parent directory

read -r -d '' UTILS <<'EOF'
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
tmux split-window
tmux split-window

# run populate explicitly later so we can tell when it's done
run_in_pane 0 "$UTILS"
run_in_pane 0 "set_pane_title cockroach"
run_in_pane 0 "cargo run --bin=omicron_dev -- db-run --no-populate"

run_in_pane 1 "$UTILS"
run_in_pane 1 "set_pane_title nexus"
run_in_pane 1 "wait_for_up 32221"
run_in_pane 1 "cargo run --bin=nexus -- examples/config.toml"

run_in_pane 2 "$UTILS"
run_in_pane 2 "set_pane_title sled_agent"
run_in_pane 2 "wait_for_up 32221"
run_in_pane 2 "wait_for_up 12220"
run_in_pane 2 "wait_for_up 12221"
run_in_pane 2 "cargo run --bin=sled_agent -- $(uuidgen) 127.0.0.1:12345 127.0.0.1:12221"

run_in_pane 3 "$UTILS"
run_in_pane 3 "set_pane_title 'seed data'"
run_in_pane 3 "wait_for_up 12345"
run_in_pane 3 "cargo run --bin=omicron_dev -- db-populate --database-url postgresql://root@127.0.0.1:32221"
run_in_pane 3 "../console/tools/populate_omicron_data.sh"

tmux attach -t omicron-console