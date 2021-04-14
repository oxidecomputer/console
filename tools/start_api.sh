#!/bin/bash

# this script assumes it's being run from inside the omicron repo and the console
# repo shares the same parent directory

read -r -d '' DEF_WAIT <<'EOF'
wait_for_up() {
  while ! echo exit | nc localhost "$1"; do sleep 0.1; done
}
EOF

run_in_pane() {
  tmux send-keys -t omicron-console:0."$1" "$2" C-m
}

tmux new -d -s omicron-console 
tmux split-window
tmux split-window
tmux split-window
run_in_pane 1 "$DEF_WAIT"
run_in_pane 2 "$DEF_WAIT"
run_in_pane 3 "$DEF_WAIT"

# db-run inits the db by default
run_in_pane 0 "cargo run --bin=omicron_dev -- db-run"

run_in_pane 1 "wait_for_up 32221"
run_in_pane 1 "cargo run --bin=nexus -- examples/config.toml"

run_in_pane 2 "wait_for_up 12220"
run_in_pane 2 "wait_for_up 12221"
run_in_pane 2 "cargo run --bin=sled_agent -- $(uuidgen) 127.0.0.1:12345 127.0.0.1:12221"

run_in_pane 3 "wait_for_up 12345"
run_in_pane 3 "sleep 3"
run_in_pane 3 "../console/tools/populate_omicron_data.sh"

tmux attach -t omicron-console