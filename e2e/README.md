# E2E Tests

## Requirements

To run the e2e test you'll need these env variables set (copy `.env.example` to `.env`):

  1. `CONSOLEAPI_API_KEY` (this is the same IMS client id used by the cli)
  2. `CONSOLEAPI_ACCESS_TOKEN` (this is the access token retrieved by an `aio login`)
  3. `CONSOLEAPI_IMS_ORG_ID` (get this from the App Builder project's `.aio` file)
  4. `CONSOLEAPI_ENV` (`prod` (default) or `stage`)

## Run

`npm run e2e`

## Test overview

The tests cover:

1. Malformed api key or access token
2. `read` APIs
3. `create,edit,delete` APIs for default and app builder projects, workspaces, integrations and services
4. check whitespaces in project and workspace title and description
