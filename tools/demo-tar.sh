#!/bin/bash
set -e

export API_URL=https://demo.eng.oxide.computer/api
rm -rf dist
yarn build
tar -C dist -cf console-$(date '+%s').tar .