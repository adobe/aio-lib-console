/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Runs in each test file's context (setupFilesAfterEnv).
// Provides shared globals: sdkClient, orgId, apiKey, accessToken, imsOrgId, env, findSDKCode.

const sdk = require('../src')
const path = require('path')
const services = require('../services.json')

require('dotenv').config({ path: path.join(__dirname, '.env') })

jest.setTimeout(120000)

const {
  CONSOLE_API_API_KEY: apiKey,
  CONSOLE_API_ACCESS_TOKEN: accessToken,
  CONSOLE_API_IMS_ORG_ID: imsOrgId,
  CONSOLE_API_ENV: env = 'prod'
} = process.env

Object.assign(global, { apiKey, accessToken, imsOrgId, env })

/** @private */
global.findSDKCode = function findSDKCode (sdkName) {
  const service = services.find(service => service.name === sdkName)
  return service ? service.code : null
}

/* eslint-disable jest/no-standalone-expect */
global.expectOkResponse = function expectOkResponse (res) {
  expect(res.ok).toBe(true)
  expect(res.status).toBe(200)
  expect(res.statusText).toBe('OK')
  expect(typeof res.body).toBe('object')
}
/* eslint-enable jest/no-standalone-expect */

/** @private */
async function init () {
  global.sdkClient = await sdk.init(accessToken, apiKey, env)
  console.log(`Initialized SDK client with env ${env} and API key ${apiKey}`)

  const res = await global.sdkClient.getOrganizations()
  const org = res.body.find(item => item.code === imsOrgId)
  if (org) {
    global.orgId = org.id
    console.log(`Found organization with ID ${global.orgId}`)
  }
}

beforeAll(init)
