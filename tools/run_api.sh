# Setup (in omicron directory). First install rustup: https://rustup.rs/. Then:
#
#   rustup install stable
#   cargo build
#   npm i -g json
#   brew install tmux

# this script assumes it's being run from inside the omicron repo

wait_for_up() {
  while ! echo exit | nc localhost "$1"; do sleep 0.1; done
}

tmux new -d -s omicron-console

tmux send-keys "cargo run --bin=nexus -- examples/config.toml" Enter
wait_for_up 12220

tmux split-window "cargo run --bin=sled_agent -- $(uuidgen) 127.0.0.1:12345 127.0.0.1:12221"
wait_for_up 12221

# zsh is to prevent the pane from closing when the script is done 
tmux split-window "../console/tools/populate_omicron_data.sh; zsh"

tmux attach-session -t omicron-console
