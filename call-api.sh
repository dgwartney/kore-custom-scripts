#/bin/bash

[ -r .env ] && source .env

curl --location 'https://agent-platform.kore.ai/api/v1/serverless/foo' \
--header "Authorization: Bearer $API_KEY" \
--header 'Content-Type: application/json' \
--data '{"function_name":"restCountries","args":{"name": "Germany"}}'

