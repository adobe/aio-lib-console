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
const { codes } = require('../src/SDKErrors')
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
let fireflyProjectId, projectId, defaultWorkspaceId, workspaceId, orgId, fireflyWorkspaceId

const ts = new Date().getTime()

const projectName = 'PN' + ts
const fireflyProjectName = 'FPN' + ts
const projectDescription = 'PDESC' + ts
const modifiedProjectDescription = 'mod' + ts
const workspaceName = 'WN' + ts
const fireflyWorkspaceName = 'FWN' + ts
const workspaceDescription = 'WDESC' + ts
const modifiedWorkspaceDescription = 'mod' + ts
const credentialNameAdobeId = 'cred-oauth' + ts
const credentialNameEntp = 'cred-entp' + ts

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
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['runtime', 'projectId', 'appId', 'workspaces', 'projectType']))
    expect(Array.isArray(res.body.workspaces)).toBe(true)
    expect(res.body.workspaces[0].workspaceId).toBeDefined()
    fireflyProjectId = res.body.projectId
    console.log('Firefly Project created with Id: ' + fireflyProjectId)
  })

  test('test createProject API (default project type)', async () => {
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
    console.log('Default workspace was created with Id: ' + defaultWorkspaceId)
  })

  test('test editProject API (default project type)', async () => {
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

  test('test editProject API for firefly project', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()

    const res = await sdkClient.editProject(
      orgId,
      fireflyProjectId,
      { name: fireflyProjectName, description: modifiedProjectDescription, title: 'modified project title', type: 'jaeger' }
    )
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.description).toEqual(modifiedProjectDescription)
    expect(res.body.title).toEqual('modified project title')
    expect(res.body.id).toEqual(fireflyProjectId)
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
    expect(res.body.description).toEqual(modifiedProjectDescription)
  })

  test('test createWorkspace API for default project type - should fail because only one is allowed for a default project', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(defaultWorkspaceId).toBeDefined()

    const res = sdkClient.createWorkspace(orgId, projectId, { name: workspaceName, description: workspaceDescription })
    await expect(res).rejects.toEqual(
      new codes.ERROR_CREATE_WORKSPACE({
        messageValues: '400 - Bad Request ("Only one workspace allowed for project type default")'
      }))
  })

  /*  This is required because "Only one workspace allowed for project type default" */
  test('test deleteWorkspace API for default project type (to delete the default workspace)', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(defaultWorkspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, projectId, defaultWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('test createWorkspace API for default project type', async () => {
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

  test('test createWorkspace API for firefly project type', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    const res = await sdkClient.createWorkspace(orgId, fireflyProjectId, { name: fireflyWorkspaceName, title: 'workspace title', description: workspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(fireflyProjectId)
    fireflyWorkspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + fireflyWorkspaceId)
  })

  test('test getWorkspacesForProject API for firefly project type', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await sdkClient.getWorkspacesForProject(orgId, fireflyProjectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'title', 'description', 'id']))
    const workspaceNames = res.body.map(x => x.name)
    expect(workspaceNames).toEqual(expect.arrayContaining(['Production', fireflyWorkspaceName])) // no Stage workspace by default
    expect(res.body.map(x => x.id)).toEqual(expect.arrayContaining([fireflyWorkspaceId]))
  })

  test('test getWorkspacesForProject API for default project type', async () => {
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

  test('test editWorkspace API for default project type', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.editWorkspace(orgId, projectId, workspaceId, { name: workspaceName, description: modifiedWorkspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(res.body.description).toBe(modifiedWorkspaceDescription)
  })

  test('test editWorkspace API for firefly project type', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await sdkClient.editWorkspace(orgId, fireflyProjectId, fireflyWorkspaceId, { name: fireflyWorkspaceName, description: modifiedWorkspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(res.body.description).toBe(modifiedWorkspaceDescription)
  })

  test('test getWorkspace API for default project type', async () => {
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

  test('test getWorkspace API for firefly project type', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await sdkClient.getWorkspace(orgId, fireflyProjectId, fireflyWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.description).toEqual(modifiedWorkspaceDescription)
    expect(res.body.id).toEqual(fireflyWorkspaceId)
  })

  test('test getProjectForWorkspace API for default project type', async () => {
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

  test('test getProjectForWorkspace API for firefly project type', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await sdkClient.getProjectForWorkspace(orgId, fireflyWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(res.body.projectId).toEqual(fireflyProjectId)
    expect(res.body.workspaceId).toEqual(fireflyWorkspaceId)
  })
})

describe('Workspace credential test', () => {
  describe('Enterprise credentials', () => {
    let credentialId, fromCredentialId

    test('test createEnterpriseCredential API', async () => {
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const keyPair = cert.generate('aio-lib-console-e2e', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
      const certFile = tmp.fileSync({ postfix: '.crt' })
      fs.writeFileSync(certFile.fd, keyPair.cert)
      const res = await sdkClient.createEnterpriseCredential(orgId, projectId, workspaceId, fs.createReadStream(certFile.name), credentialNameEntp, 'just a desc')
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      credentialId = res.body.id
      console.log('Entp integration created with Id: ', credentialId)
    })

    test('test getCredentials API (service)', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.getCredentials(orgId, projectId, workspaceId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0].id_workspace).toEqual(workspaceId)
      expect(res.body[0].id_integration).toEqual(credentialId)
      fromCredentialId = res.body[0].id_integration
      expect(res.body[0].flow_type).toEqual('entp')
      expect(res.body[0].integration_type).toEqual('service')
    })

    test('getSDKProperties', async () => {
      expect(orgId).toBeDefined()
      expect(fromCredentialId).toBeDefined()

      const anyValidSDKCodeIsFine = 'AdobeAnalyticsSDK'
      const res = await sdkClient.getSDKProperties(orgId, fromCredentialId, anyValidSDKCodeIsFine)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })

    test('test subscribeCredentialToServices API (AdobeIOManagementAPISDK)', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const sdkCode = findSDKCode('I/O Management API')
      const res = await sdkClient.subscribeCredentialToServices(orgId, projectId, workspaceId, 'entp', credentialId, [
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
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
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
      expect(res.body.project.workspace.details.credentials[0].id).toEqual(credentialId)
      expect(res.body.project.workspace.details.credentials[0].integration_type).toEqual('service')
      expect(Array.isArray(res.body.project.workspace.details.services)).toBe(true)
      expect(typeof (res.body.project.workspace.details.runtime)).toBe('object')
    })

    // organization integration APIs on workspace credentials

    test('test getIntegration API', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      const res = await sdkClient.getIntegration(orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.body.id).toEqual(credentialId)
      expect(res.body.orgId).toEqual(orgId)
      expect(res.body.name).toEqual(credentialNameEntp)
      expect(res.body.type).toEqual('entp')
    })

    test('test getIntegrationSecrets API', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      const res = await sdkClient.getIntegrationSecrets(orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof res.body).toBe('object')
      expect(res.body.client_id).toBeDefined()
      expect(res.body.client_secrets).toBeDefined()
    })

    test('test uploadAndBindCertificate API', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed

      expect(orgId).toBeDefined()

      const keyPair = cert.generate('aio-lib-console-e2e-additional-certificate', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
      const certFile = tmp.fileSync({ postfix: '.crt' })
      fs.writeFileSync(certFile.fd, keyPair.cert)
      const res = await sdkClient.uploadAndBindCertificate(orgId, credentialId, fs.createReadStream(certFile.name))
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof (res.body)).toBe('object')
    })

    // delete
    test('test deleteCredential API (integrationType: entp)', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.deleteCredential(orgId, projectId, workspaceId, 'entp', credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  describe('AdobeID credentials', () => {
    let credentialId

    test('test createAdobeIdCredential API', async () => {
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.createAdobeIdCredential(orgId, projectId, workspaceId, { name: credentialNameAdobeId, description: 'testing ng console api', platform: 'apiKey', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      credentialId = res.body.id
      console.log('OAuth integration created with Id: ', credentialId)
    })

    test('test getCredentials API (oauthweb)', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.getCredentials(orgId, projectId, workspaceId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body[0].id_workspace).toEqual(workspaceId)
      expect(res.body[0].id_integration).toEqual(credentialId)
      expect(res.body[0].flow_type).toEqual('adobeid')
      expect(res.body[0].integration_type).toEqual('apikey')
    })

    test('test subscribeCredentialToServices API (Adobe Stock)', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const sdkCode = findSDKCode('Adobe Stock')
      const res = await sdkClient.subscribeCredentialToServices(orgId, projectId, workspaceId, 'adobeid', credentialId, [
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

    test('test getWorkspaceForCredential API', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.getWorkspaceForCredential(orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(typeof (res.body)).toBe('object')
      expect(res.body.projectId).toEqual(projectId)
      expect(res.body.workspaceId).toEqual(workspaceId)
    })

    // organization integration APIs on workspace credentials
    test('test getIntegration API', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      const res = await sdkClient.getIntegration(orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.body.id).toEqual(credentialId)
      expect(res.body.orgId).toEqual(orgId)
      expect(res.body.name).toEqual(credentialNameAdobeId)
      expect(res.body.type).toEqual('adobeid')
    })

    test('test getIntegrationSecrets API', async () => {
      expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      const res = await sdkClient.getIntegrationSecrets(orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof res.body).toBe('object')
      expect(res.body.client_id).toBeDefined()
      expect(res.body.client_secrets).toBeDefined()
    })

    // atlas policy apis - commented out because return 405 method not allowed ? - tracked internally at IOC-4290
    // test('test getAtlasApplicationPolicy API', async () => {
    //   expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
    //   expect(orgId).toBeDefined()
    //   const res = await sdkClient.getAtlasApplicationPolicy(orgId, credentialId)
    //   expect(res.ok).toBe(true)
    //   expect(res.status).toBe(200)
    //   expect(typeof res.body).toBe('object')
    //   expect(res.body.orgCode).toEqual(imsOrgId)
    //   expect(res.body.appCode).toBeDefined()
    //   expect(res.body.appPolicyCode).toBeDefined()
    //   expect(res.body.quotaPolicyCode).toBeDefined()
    // })

    // test('test getAtlasQuotaUsage API', async () => {
    //   expect(credentialId).toBeDefined() // if not, createEnterpriseIntegration test failed
    //   expect(orgId).toBeDefined()
    //   const res = await sdkClient.getAtlasQuotaUsage(orgId, credentialId)
    //   expect(res.ok).toBe(true)
    //   expect(res.status).toBe(200)
    //   expect(typeof res.body).toBe('object')
    //   expect(res.body.orgCode).toEqual(imsOrgId)
    //   expect(res.body.planCode).toBeDefined()
    //   expect(res.body.policyType).toBeDefined()
    //   expect(res.body.policyCode).toBeDefined()
    //   expect(res.body.availableQuantity).toBeDefined()
    //   expect(res.body.consumedQuantity).toBeDefined()
    // })

    // delete
    test('test deleteCredential API (integrationType: adobeid)', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await sdkClient.deleteCredential(orgId, projectId, workspaceId, 'adobeid', credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  // missing analytics credentials tests
})

describe('Extension API tests', () => {
  test('test get ALL ExtensionPoints API', async () => {
    expect(orgId).toBeDefined()
    const res = await sdkClient.getAllExtensionPoints(orgId, 'firefly')
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })
  test('test update endpoints for workspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()
    const endpoints = {
      endpoints: {
        'firefly/excshell/1': {
          view: {
            href: 'https://teste2e.adobeio-static.net/updatedapp-0.0.1/index.html'
          }
        }
      }
    }
    const res = await sdkClient.updateEndPointsInWorkspace(orgId, projectId, workspaceId, endpoints)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })
  test('test get endpoints for workspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()
    const res = await sdkClient.getEndPointsInWorkspace(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })
})

describe('delete workspace/project', () => {
  test('test deleteWorkspace API', async () => {
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, projectId, workspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('test deleteWorkspace API for firefly project', async () => {
    expect(orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, fireflyProjectId, fireflyWorkspaceId)
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

    // TODO: delete is not supported yet
    await expect(sdkClient.deleteProject(orgId, fireflyProjectId)).rejects.toThrowError('[CoreConsoleAPISDK:ERROR_DELETE_PROJECT] 400 - Bad Request ("Project Firefly can not be deleted")')
  })
})

describe('dev terms', () => {
  test('get dev terms', async () => {
    const res = await sdkClient.getDevTerms()
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
  test('check dev terms', async () => {
    expect(orgId).toBeDefined()

    const res = await sdkClient.checkOrgDevTerms(orgId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
  test('accept dev terms', async () => {
    expect(orgId).toBeDefined()
    const res = await sdkClient.acceptOrgDevTerms(orgId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})
// Test organization integrations (similar to workspace credentials), commented out
// because delete integration is failing.. - tracked internally at IOC-4291

// describe('Organization Integration tests', () => {
//   describe('Enterprise integration', () => {
//     let integrationId

//     test('test createEnterpriseIntegration API', async () => {
//       expect(orgId).toBeDefined()

//       const keyPair = cert.generate('aio-lib-console-e2e', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
//       const certFile = tmp.fileSync({ postfix: '.crt' })
//       fs.writeFileSync(certFile.fd, keyPair.cert)
//       const res = await sdkClient.createEnterpriseIntegration(orgId, fs.createReadStream(certFile.name), integrationNameEntp, 'just a desc')
//       expect(typeof (res.body)).toBe('object')
//       expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
//       integrationId = res.body.id
//       console.log('Entp integration created with Id: ', integrationId)
//     })

//     test('test getIntegrationsForOrg API (service)', async () => {
//       expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
//       expect(orgId).toBeDefined()

//       const res = await sdkClient.getIntegrationsForOrg(orgId)
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//       expect(Array.isArray(res.body.content)).toBe(true)
//       expect(String(res.body.content[0].orgId)).toEqual(orgId)
//       expect(String(res.body.content[0].id)).toEqual(integrationId)
//       expect(res.body.content[0].type).toEqual('entp')
//       expect(res.body.content[0].name).toEqual(integrationNameEntp)
//     })

//     test('test subscribeIntegrationToServices API (AdobeIOManagementAPISDK)', async () => {
//       expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
//       expect(orgId).toBeDefined()
//       expect(projectId).toBeDefined()
//       expect(workspaceId).toBeDefined()

//       const sdkCode = findSDKCode('I/O Management API')
//       const res = await sdkClient.subscribeEnterpriseIntegrationToServices(orgId, integrationId, [
//         {
//           sdkCode,
//           licenseConfigs: null,
//           roles: null
//         }
//       ])
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//       expect(typeof (res.body)).toBe('object')
//       expect(res.body).toEqual({ sdkList: [sdkCode] })
//     })

//     // add those like in credentials (refactor)
//     // - get integration / getIntegration  secrets
//     // - get bindings / upload bindings / delete binding
//     // - atlas quota

//     test('test deleteIntegration API (integrationType: entp)', async () => {
//       expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
//       expect(orgId).toBeDefined()

//       const res = await sdkClient.deleteIntegration(orgId, integrationId)
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//     })
//   })

//   describe.skip('AdobeID integration', () => {
//     let integrationId

//     test('test createAdobeIdIntegration API', async () => {
//       expect(orgId).toBeDefined()

//       const res = await sdkClient.createAdobeIdIntegration(orgId, { name: integrationNameAdobeId, description: 'testing ng console api', platform: 'Web', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(typeof (res.body)).toBe('object')
//       expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
//       integrationId = res.body.id
//       console.log('OAuth integration created with Id: ', integrationId)
//     })

//     test('test getIntegrationsForOrg API (oauthweb)', async () => {
//       expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
//       expect(orgId).toBeDefined()

//       const res = await sdkClient.getIntegrationsForOrg(orgId)
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//       expect(Array.isArray(res.body.content)).toBe(true)
//       expect(String(res.body.content[0].orgId)).toEqual(orgId)
//       expect(String(res.body.content[0].id)).toEqual(integrationId)
//       expect(res.body.content[0].type).toEqual('adobeid')
//       expect(res.body.content[0].name).toEqual(integrationNameAdobeId)
//     })

//     test('test subscribeIntegrationToServices API (Adobe Stock)', async () => {
//       expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
//       expect(orgId).toBeDefined()

//       const sdkCode = findSDKCode('Adobe Stock')
//       const res = await sdkClient.subscribeCredentialToServices(orgId, integrationId, [
//         {
//           sdkCode,
//           licenseConfigs: null,
//           roles: null
//         }
//       ])
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//       expect(typeof (res.body)).toBe('object')
//       expect(res.body).toEqual({ sdkList: [sdkCode] })
//     })

//     // add those like in credentials (refactor)
//     // - get integration / getIntegration  secrets
//     // - get bindings / upload bindings / delete binding
//     // - atlas quota

//     test('test deleteIntegration API (integrationType: adobeid)', async () => {
//       expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
//       expect(orgId).toBeDefined()

//       const res = await sdkClient.deleteIntegration(orgId, integrationId)
//       expect(res.ok).toBe(true)
//       expect(res.status).toBe(200)
//       expect(res.statusText).toBe('OK')
//     })
//   })
// })

describe('create, edit, get, delete: test trailing spaces', () => {
  let trailingProjectId, trailingWorkspaceId
  const trailingProjectName = 't' + fireflyProjectName
  const trailingWorkspaceName = 't' + fireflyWorkspaceName

  test('test trailing spaces for firefly project', async () => {
    expect(orgId).toBeDefined()

    const projectDescriptionWithTrailingSpaces = ` ${projectDescription} `
    const projectTitle = 'E2E Test Firefly Project Title'
    const projectTitleWithTrailingSpaces = ` ${projectTitle} `

    let res = await sdkClient.createFireflyProject(orgId, { name: trailingProjectName, title: projectTitleWithTrailingSpaces, description: projectDescriptionWithTrailingSpaces })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['runtime', 'projectId', 'appId', 'workspaces', 'projectType']))
    expect(Array.isArray(res.body.workspaces)).toBe(true)
    expect(res.body.workspaces[0].workspaceId).toBeDefined()
    trailingProjectId = res.body.projectId
    console.log('Firefly Project created with Id: ' + trailingProjectId)

    // ! trailing spaces are removed when get or edit
    res = await sdkClient.getProject(orgId, trailingProjectId)
    expect(res.body.title).toEqual(projectTitle)
    expect(res.body.description).toEqual(projectDescription)

    const modifiedTitle = 'some other title'
    res = await sdkClient.editProject(orgId, trailingProjectId, { name: trailingProjectName, title: ` ${modifiedTitle} `, description: ` ${modifiedProjectDescription} ` })

    expect(res.body.title).toEqual(modifiedTitle)
    expect(res.body.description).toEqual(modifiedProjectDescription)
  })

  test('test trailing spaces for firefly workspace', async () => {
    expect(orgId).toBeDefined()
    expect(trailingProjectId).toBeDefined()

    const workspaceTitle = 'workspace title'
    const workspaceTitleWithTrailingSpaces = ` ${workspaceTitle} `
    const workspaceDescriptionWithTrailingSpaces = ` ${workspaceDescription} `

    let res = await sdkClient.createWorkspace(orgId, trailingProjectId, { name: trailingWorkspaceName, title: workspaceTitleWithTrailingSpaces, description: workspaceDescriptionWithTrailingSpaces })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(trailingProjectId)
    trailingWorkspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + trailingWorkspaceId)

    // ! trailing spaces are removed when get or edit

    res = await sdkClient.getWorkspace(orgId, trailingProjectId, trailingWorkspaceId)
    expect(res.body.title).toEqual(workspaceTitle)
    expect(res.body.description).toEqual(workspaceDescription)

    const modifiedTitle = 'some other title'
    res = await sdkClient.editWorkspace(orgId, trailingProjectId, trailingWorkspaceId, { name: trailingWorkspaceName, title: ` ${modifiedTitle} `, description: ` ${modifiedWorkspaceDescription} ` })
    expect(res.body.title).toEqual(modifiedTitle)
    expect(res.body.description).toEqual(modifiedProjectDescription)
  })
  test('delete', async () => {
    expect(orgId).toBeDefined()
    expect(trailingProjectId).toBeDefined()
    expect(trailingWorkspaceId).toBeDefined()

    const res = await sdkClient.deleteWorkspace(orgId, trailingProjectId, trailingWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')

    // TODO: delete is not supported yet
    await expect(sdkClient.deleteProject(orgId, trailingProjectId)).rejects.toThrowError('[CoreConsoleAPISDK:ERROR_DELETE_PROJECT] 400 - Bad Request ("Project Firefly can not be deleted")')
  })
})
