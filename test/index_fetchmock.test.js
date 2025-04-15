/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const mockFetch = jest.fn()
jest.mock('@adobe/aio-lib-core-networking', () => ({
  createFetch: jest.fn(() => mockFetch),
  HttpExponentialBackoff: jest.fn()
}))
const sdk = require('../src')
const fs = require('fs')
const path = require('path')

const apiSpec = fs.readFileSync(path.join(__dirname, '../spec/api.json'))
const apiSpecJSON = JSON.parse(apiSpec.toString())
const endpointBaseURL = apiSpecJSON.servers[0].url
  .replace(/\/+$/, '') // remove any trailing forward slashes, if any
  .replace(/developers-stage.adobe.io/g, 'developers.adobe.io/console') // substitute for the right api server

jest.unmock('swagger-client')

const mockResponseWithMethodOnce = (url, method, response) => {
  mockFetch.mockReset()
  const mockBody = jest.fn(() => Promise.resolve(response))
  const apaptedMockRes = {
    ok: true,
    statusText: 'success',
    blob: { call: mockBody }
  }
  mockFetch.mockResolvedValueOnce(apaptedMockRes)
}

describe('getOrganizations', () => {
  test('with apikey', async () => {
    const url = `${endpointBaseURL}/organizations`
    const method = 'GET'
    const sdkClient = await sdk.init('accesstoken', 'apiKey')

    mockResponseWithMethodOnce(url, method, [
      {
        id: '918',
        code: '048F5DE85620B4D8',
        name: 'MAC New Feature Testing',
        description: null,
        type: 'entp',
        roles: [
          {
            principal: '048F5DE85620B4D8',
            organization: '048F5DE85620B4D8',
            target: '048F5DE85620B4D8',
            named_role: 'org_admin',
            target_type: 'TRG_ORG',
            target_data: {}
          }
        ],
        role: 'ADMIN'
      }
    ])
    // check success response
    const res = await sdkClient.getOrganizations()
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.data)).toBe(true)
    expect(Object.keys(res.data[0])).toEqual(expect.arrayContaining(['name', 'roles', 'type', 'description', 'id']))
  })

  test('without apiKey', async () => {
    const url = `${endpointBaseURL}/organizations`
    const method = 'GET'
    const sdkClient = await sdk.init('accesstoken')

    mockResponseWithMethodOnce(url, method, [{}])
    // check success response
    await expect(sdkClient.getOrganizations()).rejects.toThrow('[CoreConsoleAPISDK:ERROR_GET_ORGANIZATIONS] Error: Required parameter x-api-key is not provided')
  })
})

describe('getApplicationExtensions (xr api)', () => {
  test('spec is missing', async () => {
    // remove getApplicationExtensions spec path
    const swaggerSpec = structuredClone(require('../spec/api.json'))
    delete swaggerSpec.paths['/console/organizations/{orgId}/xr-api/v1/app']
    expect(swaggerSpec.paths['/console/organizations/{orgId}/xr-api/v1/app']).not.toBeDefined()

    const sdkClient = await sdk.init('accesstoken', 'apiKey', undefined, swaggerSpec)
    expect(typeof sdkClient.sdk.apis.Extensions.get_console_organizations__orgId__xr_api_v1_app).not.toEqual('function')

    await expect(sdkClient.getApplicationExtensions('orgId', 'appId'))
      .rejects
      .toThrow('[CoreConsoleAPISDK:ERROR_GET_APPLICATION_EXTENSIONS] TypeError: this.sdk.apis.Extensions.get_console_organizations__orgId__xr_api_v1_app is not a function')
  })

  test('spec is available', async () => {
    const sdkClient = await sdk.init('accesstoken', 'apiKey')
    expect(typeof sdkClient.sdk.apis.Extensions.get_console_organizations__orgId__xr_api_v1_app).toEqual('function')

    const res = await sdkClient.getApplicationExtensions('orgId', 'appId')
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.data)).toBe(true)
  })
})
