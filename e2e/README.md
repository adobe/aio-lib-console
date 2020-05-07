# E2E Tests

## Requirements

To run the e2e test you'll need these env variables set:
  1. `CONSOLEAPI_API_KEY`
  2. `CONSOLEAPI_ACCESS_TOKEN`
  3. `CONSOLEAPI_IMS_ORG_ID`
  3. `CONSOLEAPI_ENV` (`prod` (default) or `stage`)

## Run

`npm run e2e`

## Test overview

The tests cover:

1. Malformed api key or access token
2. `read` APIs
