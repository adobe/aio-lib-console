/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const sdk = require('../src')
const path = require('path')
const services = require('../services.json')
const cert = require('@adobe/aio-cli-plugin-certificate')
const fs = require('fs')
const tmp = require('tmp')

// load .env values in the e2e folder, if any
require('dotenv').config({ path: path.join(__dirname, '.env') })

let sdkClient = {}
const apiKey = process.env.CONSOLEAPI_API_KEY
const accessToken = process.env.CONSOLEAPI_ACCESS_TOKEN
const imsOrgId = process.env.CONSOLEAPI_IMS_ORG_ID
const env = process.env.CONSOLEAPI_ENV || 'prod'

// these ids will be assigned when creating the project and workspace dynamically for the test
let fireflyProjectId, projectId, defaultWorkspaceId, workspaceId, orgId

const ts = new Date().getTime()

const projectName = 'PN' + ts
const fireflyProjectName = 'FPN' + ts
const projectDescription = 'PDESC' + ts
const modifiedProjectDescription = 'mod' + ts
const workspaceName = 'WN' + ts
const workspaceDescription = 'WDESC' + ts
const modifiedWorkspaceDescription = 'mod' + ts
const integrationName = 'oauth' + ts
const integrationNameEntp = 'entp' + ts

beforeAll(async () => {
  sdkClient = await sdk.init(accessToken, apiKey, env)
})

const findSDKCode = (sdkName) => {
  const service = services.find(service => service.name === sdkName)
  return service ? service.code : null
}

describe('init and input checks', () => {
  test('sdk init test', async () => {
    expect(sdkClient.apiKey).toBe(apiKey)
    expect(sdkClient.accessToken).toBe(accessToken)
    expect(['prod', 'stage']).toContain(sdkClient.env)
  })

  test('test bad access token', async () => {
    const _sdkClient = await sdk.init('bad_access_token', apiKey, env)
    const promise = _sdkClient.getOrganizations()
    return expect(promise).rejects.toThrow('401')
  })

  test('test bad api key', async () => {
    const _sdkClient = await sdk.init(accessToken, 'bad_api_key', env)
    const promise = _sdkClient.getOrganizations()
    return expect(promise).rejects.toThrow('403')
  })
})

describe('organizations', () => {
  test('test getOrganizations API', async () => {
    const res = await sdkClient.getOrganizations()
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'roles', 'type', 'description', 'id']))

    // get org id from ims org id
    const org = res.body.find(item => item.code === imsOrgId)
    if (org) {
      orgId = org.id
    }
  })

  test('test getProjectsForOrg API', async () => {
    expect(orgId).toBeDefined()

    const res = await sdkClient.getProjectsForOrg(orgId)
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'org_id', 'who_created', 'description', 'appId', 'id']))
  })
})

describe('create, edit, get', () => {
  test('test createFireflyProject API', async () => {
    expect(orgId).toBeDefined()

    const res = await sdkClient.createFireflyProject(orgId, { name: fireflyProjectName, title: 'E2ETestFireflyProjectTitle', description: projectDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['runtime', 'projectId', 'appId']))
    fireflyProjectId = res.body.projectId
    console.log('Firefly Project created with Id: ' + fireflyProjectId)
  })

  test('test createProject API', async () => {
    expect(orgId).toBeDefined()

    const projectType = 'default'
    const res = await sdkClient.createProject(orgId, { name: projectName, title: 'E2ETestDefaultProjectTitle', description: projectDescription, type: projectType })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'projectType', 'workspaceId']))
    expect(res.body.projectType).toEqual(projectType)
    projectId = res.body.projectId
    defaultWorkspaceId = res.body.workspaceId
    console.log('Project created with Id: ' + projectId)
  })

  test('test editProject API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await sdkClient.editProject(orgId, projectId, { name: projectName, description: modifiedProjectDescription, title: 'modified project title', type: 'default' })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.description).toEqual(modifiedProjectDescription)
    expect(res.body.id).toEqual(projectId)
  })

  test('test getProject API (default type)', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await sdkClient.getProject(orgId, projectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.name).toEqual(projectName)
    expect(res.body.appId).toBeFalsy()
    expect(res.body.id).toEqual(projectId)
  })

  test('test getProject API (firefly project type)', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()

    const res = await sdkClient.getProject(orgId, fireflyProjectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.name).toEqual(fireflyProjectName)
    expect(res.body.appId).toBeTruthy()
    expect(res.body.id).toEqual(fireflyProjectId)
  })
  /*  This is required because "Only one workspace allowed for project type default" */
  test('test deleteWorkspace API (to delete the default workspace)', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(defaultWorkspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, projectId, defaultWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('test createWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await sdkClient.createWorkspace(orgId, projectId, { name: workspaceName, description: workspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(projectId)
    workspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + workspaceId)
  })

  test('test getWorkspacesForProject API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getWorkspacesForProject(orgId, projectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'title', 'description', 'id']))
    expect(res.body[0].name).toEqual(workspaceName)
    expect(res.body[0].id).toEqual(workspaceId)
  })

  test('test editWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.editWorkspace(orgId, projectId, workspaceId, { name: workspaceName, description: modifiedWorkspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(res.body.description).toBe(modifiedWorkspaceDescription)
  })

  test('test getWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getWorkspace(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.description).toEqual(modifiedWorkspaceDescription)
    expect(res.body.id).toEqual(workspaceId)
  })

  test('test getProjectForWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getProjectForWorkspace(orgId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.projectId).toEqual(projectId)
    expect(res.body.workspaceId).toEqual(workspaceId)
  })
})

describe('Enterprise integration tests', () => {
  let integrationId

  test('test createEnterpriseIntegration API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const keyPair = cert.generate('aio-lib-console-e2e', 365 /* days */, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
    const certFile = tmp.fileSync({ postfix: '.crt' })
    fs.writeFileSync(certFile.fd, keyPair.cert)
    const res = await sdkClient.createEnterpriseIntegration(orgId, projectId, workspaceId, fs.createReadStream(certFile.name), integrationNameEntp, 'just a desc')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
    integrationId = res.body.id
    console.log('Entp integration created with Id: ', integrationId)
  })

  test('test getIntegrations API (service)', async () => {
    expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getIntegrations(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id_workspace).toEqual(workspaceId)
    expect(res.body[0].id_integration).toEqual(integrationId)
    expect(res.body[0].flow_type).toEqual('entp')
    expect(res.body[0].integration_type).toEqual('service')
  })

  test('test subscribeIntegrationToServices API (AdobeIOManagementAPISDK)', async () => {
    expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const sdkCode = findSDKCode('I/O Management API')
    const res = await sdkClient.subscribeIntegrationToServices(orgId, projectId, workspaceId, 'entp', integrationId, [
      {
        sdkCode,
        licenseConfigs: null,
        roles: null
      }
    ])
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body).toEqual({ sdkList: [sdkCode] })
  })

  test('test downloadWorkspaceJson API', async () => {
    expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.downloadWorkspaceJson(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.project.id).toEqual(projectId)
    expect(res.body.project.workspace.id).toEqual(workspaceId)
    expect(Array.isArray(res.body.project.workspace.details.credentials)).toBe(true)
    expect(res.body.project.workspace.details.credentials[0].id).toEqual(integrationId)
    expect(res.body.project.workspace.details.credentials[0].integration_type).toEqual('service')
    expect(Array.isArray(res.body.project.workspace.details.services)).toBe(true)
    expect(typeof (res.body.project.workspace.details.runtime)).toBe('object')
  })

  test('test deleteIntegration API (integrationType: entp)', async () => {
    expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteIntegration(orgId, projectId, workspaceId, 'entp', integrationId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

describe('AdobeID integration tests', () => {
  let integrationId

  test('test createAdobeIdIntegration API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.createAdobeIdIntegration(orgId, projectId, workspaceId, { name: integrationName, description: 'testing ng console api', platform: 'Web', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
    integrationId = res.body.id
    console.log('OAuth integration created with Id: ', integrationId)
  })

  test('test getIntegrations API (oauthweb)', async () => {
    expect(integrationId).toBeDefined() // if not, createAdobeIdIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getIntegrations(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0].id_workspace).toEqual(workspaceId)
    expect(res.body[0].id_integration).toEqual(integrationId)
    expect(res.body[0].flow_type).toEqual('adobeid')
    expect(res.body[0].integration_type).toEqual('oauthweb')
  })

  test('test subscribeIntegrationToServices API (Adobe Stock)', async () => {
    expect(integrationId).toBeDefined() // if not, createAdobeIdIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const sdkCode = findSDKCode('Adobe Stock')
    const res = await sdkClient.subscribeIntegrationToServices(orgId, projectId, workspaceId, 'adobeid', integrationId, [
      {
        sdkCode,
        licenseConfigs: null,
        roles: null
      }
    ])
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body).toEqual({ sdkList: [sdkCode] })
  })

  test('test getWorkspaceForIntegration API', async () => {
    expect(integrationId).toBeDefined() // if not, createAdobeIdIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.getWorkspaceForIntegration(orgId, integrationId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.projectId).toEqual(projectId)
    expect(res.body.workspaceId).toEqual(workspaceId)
  })

  test('test deleteIntegration API (integrationType: adobeid)', async () => {
    expect(integrationId).toBeDefined() // if not, createAdobeIdIntegration test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteIntegration(orgId, projectId, workspaceId, 'adobeid', integrationId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

describe('delete', () => {
  test('test deleteWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('test deleteProject API (default type)', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteProject(orgId, projectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('test deleteProject API (firefly project template)', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteProject(orgId, fireflyProjectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})
