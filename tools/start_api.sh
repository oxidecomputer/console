#!/bin/bash

set -o errexit
set -o pipefail

f_flag=
while getopts f name
do
  case $name in
    f)  f_flag=1;;
    ?)  printf "Usage: %s [-f] \n" $0; exit 2;;
  esac
done
shift $(($OPTIND - 1))

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

# unless -f flag is present, refuse to start if we're not on the right omicron commit
if [ -z "$f_flag" ]; then
  PINNED_API_VERSION=$(cat ../console/OMICRON_VERSION)
  CURRENT_API_VERSION=$(git rev-parse HEAD)

  if [ "$CURRENT_API_VERSION" != "$PINNED_API_VERSION" ]; then
    echo -e "\nERROR: Omicron version pinned in console does not match HEAD\n" >&2
    echo -e "  pinned:  $PINNED_API_VERSION" >&2
    echo -e "  HEAD:    $CURRENT_API_VERSION\n" >&2
    echo -e "Check out the pinned commit and try again.\n" >&2
    exit 1
  fi
fi

tmux new -d -s omicron-console 
tmux set -t omicron-console pane-border-status top
tmux set -t omicron-console pane-border-style "bg=#BBBBBB fg=black"
tmux set -t omicron-console pane-active-border-style "bg=green fg=black"

for p in {1..5}; do
  tmux split-window
  tmux select-layout even-vertical
done

# run populate explicitly later so we can tell when it's done
run_in_pane 0 "$UTILS"
run_in_pane 0 "set_pane_title cockroach"
run_in_pane 0 "cargo run --bin=omicron-dev -- db-run --no-populate"

run_in_pane 1 "$UTILS"
run_in_pane 1 "set_pane_title clickhouse"
run_in_pane 1 "cargo run --bin omicron-dev -- ch-run"

run_in_pane 2 "$UTILS"
run_in_pane 2 "set_pane_title nexus"
run_in_pane 2 "wait_for_up 32221" # cockroach
run_in_pane 2 "cargo run --bin=omicron-dev -- db-populate --database-url postgresql://root@127.0.0.1:32221/omicron"
run_in_pane 2 "SKIP_ASIC_CONFIG=1 cargo run --bin=nexus -- nexus/examples/config.toml"

run_in_pane 3 "$UTILS"
run_in_pane 3 "set_pane_title sled-agent-sim"
run_in_pane 3 "wait_for_up 12221" # nexus internal
run_in_pane 3 "cargo run --bin=sled-agent-sim -- $(uuidgen) '[::1]:12345' 127.0.0.1:12221"

run_in_pane 4 "$UTILS"
run_in_pane 4 "set_pane_title oximeter"
run_in_pane 4 "wait_for_up 8123" # clickhouse
run_in_pane 4 "wait_for_up 12221" # nexus internal
run_in_pane 4 "cargo run --bin=oximeter run --id $(uuidgen) --address '[::1]:12223' -- oximeter/collector/config.toml"

run_in_pane 5 "$UTILS"
run_in_pane 5 "set_pane_title 'seed data'"
run_in_pane 5 "wait_for_up 12223" # oximeter
run_in_pane 5 "wait_for_up 12345" # sled agent
run_in_pane 5 "export OXIDE_HOST='http://127.0.0.1:12220'"
run_in_pane 5 "export OXIDE_TOKEN='oxide-spoof-001de000-05e4-4000-8000-000000004007'"
run_in_pane 5 "../console/tools/populate_omicron_data.sh"

tmux attach -t omicron-console
