#!/bin/bash
set -e
set -o pipefail

STYLES_PATH=libs/ui/styles
TOKENS_PATH=$STYLES_PATH/.tokens

yarn token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/main.json global,colors,main
yarn token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/operator-mode.json colors,operator-mode

# To add a new theme use the the template below and replace `<theme>` with your theme name. You'll also
# need to update the `THEMES` config object in `convert-tokens.ts`
#
# npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/<theme>.json colors,<theme>

node -r esbuild-register tools/convert-tokens
prettier -w $STYLES_PATH
