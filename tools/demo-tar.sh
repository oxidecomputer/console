#!/bin/bash
set -e

export API_URL=http://172.20.3.65/api
yarn build
cd dist
tar cf ../../../console-$(date '+%s').tar . 
cd -