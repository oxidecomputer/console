#!/bin/bash

cockroach quit --insecure --url postgresql://127.0.0.1:32221
tmux kill-session -t omicron-console