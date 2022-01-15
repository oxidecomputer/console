#!/bin/bash
set -e
set -o pipefail

STYLES_PATH=libs/ui/styles
TOKENS_PATH=$STYLES_PATH/tokens

npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/global.json global 
npx token-transformer $STYLES_PATH/tokens.json $TOKENS_PATH/main-theme.json global,colors,main 