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

const sdk = require('../src')
const path = require('path')
const services = require('../services.json')
const cert = require('@adobe/aio-cli-plugin-certificate')
const fs = require('fs')
const tmp = require('tmp')

require('dotenv').config({ path: path.join(__dirname, '.env') })

// VARS ////////////////////////////

const ts = new Date().getTime()
const credentialNameAdobeId = 'cred-oauth' + ts
const credentialNameEntp = 'cred-entp-skip' + ts

let orgId, projectId, workspaceId, credentialId, fromCredentialId

let sdkClient = {}
const {
  CONSOLE_API_API_KEY: apiKey,
  CONSOLE_API_ACCESS_TOKEN: accessToken,
  CONSOLE_API_IMS_ORG_ID: imsOrgId,
  CONSOLE_API_ENV: env = 'prod'
} = process.env

// HELPERS ////////////////////////////

/** @private */
function findSDKCode (sdkName) {
  const service = services.find(service => service.name === sdkName)
  return service ? service.code : null
}

// LIFECYCLE ////////////////////////////

beforeAll(async () => {
  const missingEnvVars = ['CONSOLE_API_API_KEY', 'CONSOLE_API_ACCESS_TOKEN', 'CONSOLE_API_IMS_ORG_ID']
    .filter(v => !process.env[v]?.trim())
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  }

  sdkClient = await sdk.init(accessToken, apiKey, env)

  // Get orgId from IMS org ID
  const orgsRes = await sdkClient.getOrganizations()
  const org = orgsRes.body.find(item => item.code === imsOrgId)
  if (org) {
    orgId = org.id
  }

  if (!orgId) {
    return
  }

  // Create a default project for credential tests
  const projName = 'CredentialsPN' + ts
  const projRes = await sdkClient.createProject(orgId, { name: projName, title: projName, description: 'e2e credentials test', type: 'default' })
  projectId = projRes.body.projectId
  const defaultWorkspaceId = projRes.body.workspaceId

  // Default project allows only one workspace; delete the default one first
  await sdkClient.deleteWorkspace(orgId, projectId, defaultWorkspaceId)

  // Create a workspace
  const wsName = 'CredentialsWN' + ts
  const wsRes = await sdkClient.createWorkspace(orgId, projectId, { name: wsName, description: 'e2e credentials test' })
  workspaceId = wsRes.body.workspaceId
})

afterAll(async () => {
  if (projectId && orgId) {
    try {
      console.log(`Cleaning up project id ${projectId}...`)
      await sdkClient.deleteProject(orgId, projectId)
      console.log(`Project ${projectId} deleted.`)
    } catch (e) {
      console.log(`Project ${projectId} was not deleted (best effort basis).`)
    }
  }
})

// TESTS ////////////////////////////

describe('Enterprise credentials', () => {
  test('createEnterpriseCredential API', async () => {
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

  // atlas policy apis - commented out because return 405 method not allowed ? - tracked internally at IOC-4290
  test('getAtlasApplicationPolicy API', async () => {
    expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
    expect(orgId).toBeDefined()
    const res = await sdkClient.getAtlasApplicationPolicy(orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.orgCode).toEqual(imsOrgId)
    expect(res.body.appCode).toBeDefined()
    expect(res.body.appPolicyCode).toBeDefined()
    expect(res.body.quotaPolicyCode).toBeDefined()
  })

  // atlas policy apis - commented out because return 405 method not allowed ? - tracked internally at IOC-4290
  test('getAtlasQuotaUsage API', async () => {
    expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
    expect(orgId).toBeDefined()
    const res = await sdkClient.getAtlasQuotaUsage(orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.orgCode).toEqual(imsOrgId)
    expect(res.body.planCode).toBeDefined()
    expect(res.body.policyType).toBeDefined()
    expect(res.body.policyCode).toBeDefined()
    expect(res.body.availableQuantity).toBeDefined()
    expect(res.body.consumedQuantity).toBeDefined()
  })

  test('getCredentials API (service)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
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

  test('subscribeCredentialToServices API (AdobeIOManagementAPISDK)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
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

  test('downloadWorkspaceJson API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
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

  test('getIntegration API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(orgId).toBeDefined()
    const res = await sdkClient.getIntegration(orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.body.id).toEqual(credentialId)
    expect(res.body.orgId).toEqual(orgId)
    expect(res.body.name).toEqual(credentialNameEntp)
    expect(res.body.type).toEqual('entp')
  })

  test('getIntegrationSecrets API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(orgId).toBeDefined()
    const res = await sdkClient.getIntegrationSecrets(orgId, credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
    expect(res.body.client_id).toBeDefined()
    expect(res.body.client_secrets).toBeDefined()
  })

  test('uploadAndBindCertificate API', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(orgId).toBeDefined()

    const keyPair = cert.generate('aio-lib-console-e2e-additional-certificate', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
    const certFile = tmp.fileSync({ postfix: '.crt' })
    fs.writeFileSync(certFile.fd, keyPair.cert)
    const res = await sdkClient.uploadAndBindCertificate(orgId, credentialId, fs.createReadStream(certFile.name))
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(typeof (res.body)).toBe('object')
  })

  test('deleteCredential API (integrationType: entp)', async () => {
    expect(credentialId).toBeDefined() // if not, createEnterpriseCredential test failed
    expect(orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await sdkClient.deleteCredential(orgId, projectId, workspaceId, 'entp', credentialId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

// AdobeID subscribeCredentialToServices for Adobe Stock
describe('AdobeID credentials - subscribeCredentialToServices (Adobe Stock)', () => {
  test('subscribeCredentialToServices API (Adobe Stock)', async () => {
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
})

// OAuth Server-to-Server getSDKProperties
describe('OAuth Server-to-Server credentials - getSDKProperties', () => {
  test('getSDKProperties', async () => {
    expect(orgId).toBeDefined()
    expect(fromCredentialId).toBeDefined()

    const anyValidSDKCodeIsFine = 'AdobeAnalyticsSDK'
    const res = await sdkClient.getSDKProperties(orgId, fromCredentialId, anyValidSDKCodeIsFine)
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
      expect(orgId).toBeDefined()

      const keyPair = cert.generate('aio-lib-console-e2e', 365, { country: 'US', state: 'CA', locality: 'SF', organization: 'Adobe', unit: 'AdobeIO' })
      const certFile = tmp.fileSync({ postfix: '.crt' })
      fs.writeFileSync(certFile.fd, keyPair.cert)
      const res = await sdkClient.createEnterpriseIntegration(orgId, fs.createReadStream(certFile.name), credentialNameEntp, 'just a desc')
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      integrationId = res.body.id
      console.log('Entp integration created with Id: ', integrationId)
    })

    test('getIntegrationsForOrg API (service)', async () => {
      expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()

      const res = await sdkClient.getIntegrationsForOrg(orgId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body.content)).toBe(true)
      expect(String(res.body.content[0].orgId)).toEqual(orgId)
      expect(String(res.body.content[0].id)).toEqual(integrationId)
      expect(res.body.content[0].type).toEqual('entp')
      expect(res.body.content[0].name).toEqual(credentialNameEntp)
    })

    test('subscribeIntegrationToServices API (AdobeIOManagementAPISDK)', async () => {
      expect(integrationId).toBeDefined() // if not, createEnterpriseIntegration test failed
      expect(orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const sdkCode = findSDKCode('I/O Management API')
      const res = await sdkClient.subscribeEnterpriseIntegrationToServices(orgId, integrationId, [
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
      expect(orgId).toBeDefined()

      const res = await sdkClient.deleteIntegration(orgId, integrationId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  describe('AdobeID integration', () => {
    let integrationId

    test('createAdobeIdIntegration API', async () => {
      expect(orgId).toBeDefined()

      const res = await sdkClient.createAdobeIdIntegration(orgId, { name: credentialNameAdobeId, description: 'testing ng console api', platform: 'Web', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      integrationId = res.body.id
      console.log('OAuth integration created with Id: ', integrationId)
    })

    test('getIntegrationsForOrg API (oauthweb)', async () => {
      expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()

      const res = await sdkClient.getIntegrationsForOrg(orgId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
      expect(Array.isArray(res.body.content)).toBe(true)
      expect(String(res.body.content[0].orgId)).toEqual(orgId)
      expect(String(res.body.content[0].id)).toEqual(integrationId)
      expect(res.body.content[0].type).toEqual('adobeid')
      expect(res.body.content[0].name).toEqual(credentialNameAdobeId)
    })

    test('subscribeIntegrationToServices API (Adobe Stock)', async () => {
      expect(integrationId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(orgId).toBeDefined()

      const sdkCode = findSDKCode('Adobe Stock')
      const res = await sdkClient.subscribeIntegrationToServices(orgId, integrationId, [
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
      expect(orgId).toBeDefined()

      const res = await sdkClient.deleteIntegration(orgId, integrationId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })
})
