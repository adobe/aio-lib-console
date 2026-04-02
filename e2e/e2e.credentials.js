/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// This file contains test code extracted from e2e.js that is currently skipped.
// Tests here are pending resolution of the issues noted below.
//    Enterprise credentials — pending IOC-4290 resolution
//    Delete credentials — pending IOC-4291 resolution

const cert = require('@adobe/aio-cli-plugin-certificate')
const fs = require('fs')
const tmp = require('tmp')

// VARS ////////////////////////////

const ts = new Date().getTime()
const credentialNameAdobeId = 'cred-oauth' + ts
const credentialNameEntp = 'cred-entp-skip' + ts

let projectId, workspaceId, credentialId, fromCredentialId

// LIFECYCLE ////////////////////////////

beforeAll(async () => {
  if (!global.orgId) {
    return
  }

  // Create a default project for credential tests
  const projName = 'CredentialsPN' + ts
  const projRes = await global.sdkClient.createProject(global.orgId, { name: projName, title: projName, description: 'e2e credentials test', type: 'default' })
  projectId = projRes.body.projectId
  const defaultWorkspaceId = projRes.body.workspaceId

  // Default project allows only one workspace; delete the default one first
  await global.sdkClient.deleteWorkspace(global.orgId, projectId, defaultWorkspaceId)

  // Create a workspace
  const wsName = 'CredentialsWN' + ts
  const wsRes = await global.sdkClient.createWorkspace(global.orgId, projectId, { name: wsName, description: 'e2e credentials test' })
  workspaceId = wsRes.body.workspaceId
})

afterAll(async () => {
  if (projectId && global.orgId) {
    try {
      console.log(`Cleaning up project id ${projectId}...`)
      await global.sdkClient.deleteProject(global.orgId, projectId)
      console.log(`Project ${projectId} deleted.`)
    } catch (e) {
      console.log(`Project ${projectId} was not deleted (best effort basis).`)
    }
  }
})

// TESTS ////////////////////////////

describe('Enterprise credentials', () => {
  test('createEnterpriseCredential API', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const keyPair = cert.generate('aio-lib-console-e2e', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
    const certFile = tmp.fileSync({ postfix: '.crt' })
    fs.writeFileSync(certFile.fd, keyPair.cert)
    const res = await global.sdkClient.createEnterpriseCredential(global.orgId, projectId, workspaceId, fs.createReadStream(certFile.name), credentialNameEntp, 'just a desc')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
    credentialId = res.body.id
    console.log('Entp integration created with Id: ', credentialId)
  })

  // atlas policy apis - commented out because return 405 method not allowed ? - tracked internally at IOC-4290
  test('getAtlasApplicationPolicy API', async () => {
    expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.getAtlasApplicationPolicy(global.orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.orgCode).toEqual(global.imsOrgId)
    expect(res.body.appCode).toBeDefined()
    expect(res.body.appPolicyCode).toBeDefined()
    expect(res.body.quotaPolicyCode).toBeDefined()
  })

  // atlas policy apis - commented out because return 405 method not allowed ? - tracked internally at IOC-4290
  test('getAtlasQuotaUsage API', async () => {
    expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.getAtlasQuotaUsage(global.orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.orgCode).toEqual(global.imsOrgId)
    expect(res.body.planCode).toBeDefined()
    expect(res.body.policyType).toBeDefined()
    expect(res.body.policyCode).toBeDefined()
    expect(res.body.availableQuantity).toBeDefined()
    expect(res.body.consumedQuantity).toBeDefined()
  })

  test('getCredentials API (service)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.getCredentials(global.orgId, projectId, workspaceId)
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
    expect(global.orgId).toBeDefined()
    expect(fromCredentialId).toBeDefined()

    const anyValidSDKCodeIsFine = 'AdobeAnalyticsSDK'
    const res = await global.sdkClient.getSDKProperties(global.orgId, fromCredentialId, anyValidSDKCodeIsFine)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('subscribeCredentialToServices API (AdobeIOManagementAPISDK)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const sdkCode = global.findSDKCode('I/O Management API')
    const res = await global.sdkClient.subscribeCredentialToServices(global.orgId, projectId, workspaceId, 'entp', credentialId, [
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

  test('downloadWorkspaceJson API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.downloadWorkspaceJson(global.orgId, projectId, workspaceId)
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

  test('getIntegration API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.getIntegration(global.orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.body.id).toEqual(credentialId)
    expect(res.body.orgId).toEqual(global.orgId)
    expect(res.body.name).toEqual(credentialNameEntp)
    expect(res.body.type).toEqual('entp')
  })

  test('getIntegrationSecrets API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.getIntegrationSecrets(global.orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.client_id).toBeDefined()
    expect(res.body.client_secrets).toBeDefined()
  })

  test('uploadAndBindCertificate API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()

    const keyPair = cert.generate('aio-lib-console-e2e-additional-certificate', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
    const certFile = tmp.fileSync({ postfix: '.crt' })
    fs.writeFileSync(certFile.fd, keyPair.cert)
    const res = await global.sdkClient.uploadAndBindCertificate(global.orgId, credentialId, fs.createReadStream(certFile.name))
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof (res.body)).toBe('object')
  })

  test('deleteCredential API (integrationType: entp)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.deleteCredential(global.orgId, projectId, workspaceId, 'entp', credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

// AdobeID subscribeCredentialToServices for Adobe Stock
describe('AdobeID credentials - subscribeCredentialToServices (Adobe Stock)', () => {
  test('subscribeCredentialToServices API (Adobe Stock)', async () => {
    expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const sdkCode = global.findSDKCode('Adobe Stock')
    const res = await global.sdkClient.subscribeCredentialToServices(global.orgId, projectId, workspaceId, 'adobeid', credentialId, [
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
})

// OAuth Server-to-Server getSDKProperties
describe('OAuth Server-to-Server credentials - getSDKProperties', () => {
  test('getSDKProperties', async () => {
    expect(global.orgId).toBeDefined()
    expect(fromCredentialId).toBeDefined()

    const anyValidSDKCodeIsFine = 'AdobeAnalyticsSDK'
    const res = await global.sdkClient.getSDKProperties(global.orgId, fromCredentialId, anyValidSDKCodeIsFine)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

// Test organization integrations (similar to workspace credentials)
// because delete integration is failing - tracked internally at IOC-4291
describe('Organization Integration tests', () => {
  describe('Enterprise integration', () => {
    let integrationId

    test('createEnterpriseIntegration API', async () => {
      expect(global.orgId).toBeDefined()

      const keyPair = cert.generate('aio-lib-console-e2e', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
      const certFile = tmp.fileSync({ postfix: '.crt' })
      fs.writeFileSync(certFile.fd, keyPair.cert)
      const res = await global.sdkClient.createEnterpriseIntegration(global.orgId, fs.createReadStream(certFile.name), credentialNameEntp, 'just a desc')
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      integrationId = res.body.id
      console.log('Entp integration created with Id: ', integrationId)
    })

    test('getIntegrationsForOrg API (service)', async () => {
      expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(global.orgId).toBeDefined()

      const res = await global.sdkClient.getIntegrationsForOrg(global.orgId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body.content)).toBe(true)
      expect(String(res.body.content[0].global.orgId)).toEqual(global.orgId)
      expect(String(res.body.content[0].id)).toEqual(integrationId)
      expect(res.body.content[0].type).toEqual('entp')
      expect(res.body.content[0].name).toEqual(credentialNameEntp)
    })

    test('subscribeIntegrationToServices API (AdobeIOManagementAPISDK)', async () => {
      expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const sdkCode = global.findSDKCode('I/O Management API')
      const res = await global.sdkClient.subscribeEnterpriseIntegrationToServices(global.orgId, integrationId, [
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

    test('deleteIntegration API (integrationType: entp)', async () => {
      expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(global.orgId).toBeDefined()

      const res = await global.sdkClient.deleteIntegration(global.orgId, integrationId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  describe('AdobeID integration', () => {
    let integrationId

    test('createAdobeIdIntegration API', async () => {
      expect(global.orgId).toBeDefined()

      const res = await global.sdkClient.createAdobeIdIntegration(global.orgId, { name: credentialNameAdobeId, description: 'testing ng console api', platform: 'Web', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      integrationId = res.body.id
      console.log('OAuth integration created with Id: ', integrationId)
    })

    test('getIntegrationsForOrg API (oauthweb)', async () => {
      expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()

      const res = await global.sdkClient.getIntegrationsForOrg(global.orgId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body.content)).toBe(true)
      expect(String(res.body.content[0].global.orgId)).toEqual(global.orgId)
      expect(String(res.body.content[0].id)).toEqual(integrationId)
      expect(res.body.content[0].type).toEqual('adobeid')
      expect(res.body.content[0].name).toEqual(credentialNameAdobeId)
    })

    test('subscribeIntegrationToServices API (Adobe Stock)', async () => {
      expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()

      const sdkCode = global.findSDKCode('Adobe Stock')
      const res = await global.sdkClient.subscribeIntegrationToServices(global.orgId, integrationId, [
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

    test('deleteIntegration API (integrationType: adobeid)', async () => {
      expect(integrationId).toBeDefined() // if not, createAdobeIdIntegration test failed
      expect(global.orgId).toBeDefined()

      const res = await global.sdkClient.deleteIntegration(global.orgId, integrationId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })
})
