#!/bin/bash

# assumes omicron is in the same dir as as the console repo 
# and it has been built with `cargo build`
../omicron/target/debug/nexus ../omicron/examples/config.toml --openapi > omicron.json

# prereq: brew install openapi-generator

# couldn't get it to pipe directly with /dev/stdin. it really wants a filename
openapi-generator generate -i omicron.json -o libs/api/__generated__ -g typescript-fetch
rm omicron.json
yarn format > /dev/null 2>&1
