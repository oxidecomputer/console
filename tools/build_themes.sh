#!/bin/bash
set -e
set -o pipefail

STYLES_PATH=libs/ui/styles
TOKENS_PATH=$STYLES_PATH/.tokens

npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/main.json global,colors,main
npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/operator-mode.json colors,operator-mode

node -r esbuild-register tools/convert-tokens
prettier -w $STYLES_PATH
