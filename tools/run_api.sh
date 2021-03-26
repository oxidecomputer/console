# Setup (in omicron directory). First install rustup: https://rustup.rs/. Then:
#
#   rustup install stable
#   cargo build
#   npm i -g json
#   brew install tmux

# this script assumes it's being run from inside the omicron repo

tmux \
  new-session  'cargo run --bin=nexus -- examples/config.toml' \; \
  split-window 'sleep 0.5 && cargo run --bin=sled_agent -- $(uuidgen) 127.0.0.1:12345 127.0.0.1:12221' \; \
  split-window 'sleep 1 && ../console/tools/populate_omicron_data.sh; zsh'
