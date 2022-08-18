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

const { codes } = require('../src/SDKErrors')
const sdk = require('../src')
const libEnv = require('@adobe/aio-lib-env')
const { STAGE_ENV, PROD_ENV } = jest.requireActual('@adobe/aio-lib-env')

jest.mock('@adobe/aio-lib-env')

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "standardTest"] }] */
// /////////////////////////////////////////////

const gApiKey = 'test-apikey'
const gAccessToken = 'test-token'
// /////////////////////////////////////////////

const createSwaggerOptions = (body) => {
  return {
    requestBody: body
  }
}

const expectedAdditionalApiParameters = (sdkInstance) => {
  return {
    Authorization: '__placeholder__',
    'x-api-key': sdkInstance.apiKey
  }
}

const createSdkClient = async (accessToken = gAccessToken, apiKey = gApiKey, env) => {
  return sdk.init(accessToken, apiKey, env)
}

// /////////////////////////////////////////////

beforeEach(() => {
  jest.restoreAllMocks()
  libEnv.getCliEnv.mockReturnValue(PROD_ENV) // default
})

test('sdk init test', async () => {
  const sdkClient = await createSdkClient()

  expect(sdkClient.apiKey).toBe(gApiKey)
  expect(sdkClient.accessToken).toBe(gAccessToken)
})

test('sdk init test - no accessToken', async () => {
  return expect(sdk.init(null)).rejects.toEqual(
    new codes.ERROR_SDK_INITIALIZATION({ messageValues: 'accessToken' })
  )
})

test('sdk constructor', async () => {
  let client

  // default, should use PROD endpoint (default for global cli env is PROD)
  client = await createSdkClient()
  expect(client.env).toEqual(PROD_ENV)

  // if constructor parameter is set to STAGE, should use STAGE endpoint (overrides global env)
  client = await createSdkClient(undefined, undefined, STAGE_ENV)
  expect(client.env).toEqual(STAGE_ENV)

  // if constructor parameter is set to an unknown string, should use PROD endpoint (default env)
  client = await createSdkClient(undefined, undefined, 'gibberish')
  expect(client.env).toEqual(PROD_ENV)

  // if constructor parameter is set to null, should use PROD endpoint (default env)
  client = await createSdkClient(undefined, undefined, null)
  expect(client.env).toEqual(PROD_ENV)

  // if global cli env is set to STAGE, should use it
  libEnv.getCliEnv.mockReturnValue(STAGE_ENV)
  client = await createSdkClient()
  expect(client.env).toEqual(STAGE_ENV)

  // if global cli env is set to PROD, should use it
  libEnv.getCliEnv.mockReturnValue(PROD_ENV)
  client = await createSdkClient()
  expect(client.env).toEqual(PROD_ENV)

  // default, should use PROD endpoint (global cli env is not set)
  libEnv.getCliEnv.mockReturnValue(null)
  client = await createSdkClient()
  expect(client.env).toEqual(PROD_ENV)
})

/** @private */
async function standardTest ({
  fullyQualifiedApiName, apiParameters, apiOptions,
  sdkFunctionName, sdkArgs,
  successReturnValue = { body: {} },
  ErrorClass
}) {
  const sdkClient = await createSdkClient()

  const fullApiParameters = { ...expectedAdditionalApiParameters(sdkClient), ...apiParameters }

  const [, apiFunction] = fullyQualifiedApiName.split('.')

  if (!ErrorClass) {
    throw new Error('ErrorClass not defined for standardTest')
  }

  // sdk function name is the same as the apiname (without the namespace) by default
  // so if it is not set, we set it
  // this means in the SDK the namespace is flattened, so functions have to have unique names
  if (!sdkFunctionName) {
    sdkFunctionName = apiFunction
  }
  const fn = sdkClient[sdkFunctionName]
  let mockFn

  // success case
  mockFn = sdkClient.sdk.mockResolved(fullyQualifiedApiName, successReturnValue)
  await expect(fn.apply(sdkClient, sdkArgs)).resolves.toEqual(successReturnValue)
  if (typeof (apiOptions) === 'object' && Object.keys(apiOptions).length === 0) {
    expect(mockFn).toHaveBeenCalledWith(fullApiParameters)
  } else {
    expect(mockFn).toHaveBeenCalledWith(fullApiParameters, expect.objectContaining({ requestBody: apiOptions.requestBody }))
  }

  // failure case
  const err = new Error('some API error')
  mockFn = sdkClient.sdk.mockRejected(fullyQualifiedApiName, err)
  await expect(fn.apply(sdkClient, sdkArgs)).rejects.toEqual(
    new ErrorClass({ sdkDetails: { ...sdkArgs }, messageValues: err })
  )
  if (typeof (apiOptions) === 'object' && Object.keys(apiOptions).length === 0) {
    expect(mockFn).toHaveBeenCalledWith(fullApiParameters)
  } else {
    expect(mockFn).toHaveBeenCalledWith(fullApiParameters, expect.objectContaining(apiOptions))
  }
}

test('getProjectsForOrg', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = { orgId: 'organizationId' }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'projects.get_console_organizations__orgId__projects',
    sdkFunctionName: 'getProjectsForOrg',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECTS_BY_ORG_ID
  })
})

test('createProject', async () => {
  const sdkArgs = ['organizationId', {}]
  const apiParameters = { orgId: 'organizationId' }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'projects.post_console_organizations__orgId__projects',
    sdkFunctionName: 'createProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_PROJECT
  })
})

test('createFireflyProject', async () => {
  const sdkArgs = ['organizationId', {}]
  const apiParameters = { orgId: 'organizationId' }
  const apiOptions = createSwaggerOptions({ type: 'jaeger' })

  await standardTest({
    fullyQualifiedApiName: 'projects.post_console_organizations__orgId__projects',
    sdkFunctionName: 'createFireflyProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_PROJECT
  })
})

test('getWorkspacesForProject', async () => {
  const sdkArgs = ['organizationId', 'projectId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'projects.get_console_organizations__orgId__projects__projectId__workspaces',
    sdkFunctionName: 'getWorkspacesForProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_WORKSPACES_BY_PROJECT_ID
  })
})

test('deleteProject', async () => {
  const sdkArgs = ['organizationId', 'projectId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'projects.delete_console_organizations__orgId__projects__projectId_',
    sdkFunctionName: 'deleteProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DELETE_PROJECT
  })
})

test('editProject', async () => {
  const sdkArgs = ['organizationId', 'projectId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'projects.patch_console_organizations__orgId__projects__projectId_',
    sdkFunctionName: 'editProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_EDIT_PROJECT
  })
})

test('getProject', async () => {
  const sdkArgs = ['organizationId', 'projectId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'projects.get_console_organizations__orgId__projects__projectId_',
    sdkFunctionName: 'getProject',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECT_BY_ID
  })
})

test('downloadWorkspaceJson', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__download',
    sdkFunctionName: 'downloadWorkspaceJson',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DOWNLOAD_WORKSPACE_JSON
  })
})

test('createWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.post_console_organizations__orgId__projects__projectId__workspaces',
    sdkFunctionName: 'createWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_WORKSPACE
  })
})

test('editWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.patch_console_organizations__orgId__projects__projectId__workspaces__workspaceId_',
    sdkFunctionName: 'editWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_EDIT_WORKSPACE
  })
})

test('getWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId_',
    sdkFunctionName: 'getWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_WORKSPACE_BY_ID
  })
})

test('deleteWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId_',
    sdkFunctionName: 'deleteWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    successReturnValue: { body: true, ok: true },
    ErrorClass: codes.ERROR_DELETE_WORKSPACE
  })
})

test('getCredentials', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials',
    sdkFunctionName: 'getCredentials',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_CREDENTIALS
  })
})

test('createEnterpriseCredential', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'certificate', 'name', 'description']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({ certificate: 'certificate', description: 'description', name: 'name' })

  await standardTest({
    fullyQualifiedApiName: 'workspaces.post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_entp',
    sdkFunctionName: 'createEnterpriseCredential',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ENTERPRISE_CREDENTIAL
  })
})

test('createAdobeIdCredential', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'workspaces.post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_adobeId',
    sdkFunctionName: 'createAdobeIdCredential',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ADOBEID_CREDENTIAL
  })
})

test('createAnalyticsCredential', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_analytics',
    sdkFunctionName: 'createAnalyticsCredential',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ANALYTICS_CREDENTIAL
  })
})

test('subscribeCredentialToServices', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'credentialType', 'credentialId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId',
    credentialType: 'credentialType',
    credentialId: 'credentialId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.put_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__credentialType___credentialId__services',
    sdkFunctionName: 'subscribeCredentialToServices',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_SUBSCRIBE_CREDENTIAL_TO_SERVICES
  })
})

test('getWorkspaceForCredential', async () => {
  const sdkArgs = ['organizationId', 'credentialId']
  const apiParameters = {
    orgId: 'organizationId',
    credentialId: 'credentialId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects_workspaces_credentials__credentialId_',
    sdkFunctionName: 'getWorkspaceForCredential',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECT_WORKSPACE_BY_CREDENTIAL
  })
})

test('getProjectForWorkspace', async () => {
  const sdkArgs = ['organizationId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects_workspaces_workspaces__workspaceId_',
    sdkFunctionName: 'getProjectForWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECT_BY_WORKSPACE
  })
})

test('deleteCredential', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'credentialType', 'credentialId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId',
    credentialType: 'credentialType',
    credentialId: 'credentialId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__credentialId_',
    sdkFunctionName: 'deleteCredential',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DELETE_CREDENTIAL
  })
})

test('getOrganizations', async () => {
  const sdkArgs = []
  const apiParameters = {}
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations',
    sdkFunctionName: 'getOrganizations',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ORGANIZATIONS
  })
})

test('getServicesForOrg', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = {
    orgId: 'organizationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__services',
    sdkFunctionName: 'getServicesForOrg',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_SERVICES_FOR_ORG
  })
})

test('createRuntimeNamespace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'runtime.post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__namespace',
    sdkFunctionName: 'createRuntimeNamespace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_RUNTIME_NAMESPACE
  })
})

test('getPluginsForWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__plugins',
    sdkFunctionName: 'getPluginsForWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PLUGINS_BY_WORKSPACE
  })
})

test('getIntegrationsForOrg', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = {
    orgId: 'organizationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__integrations',
    sdkFunctionName: 'getIntegrationsForOrg',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_INTEGRATIONS_BY_ORG
  })
})

test('createEnterpriseIntegration', async () => {
  const sdkArgs = ['organizationId', 'certificate', 'name', 'description']
  const apiParameters = {
    orgId: 'organizationId',
    description: 'description',
    name: 'name'
  }
  const apiOptions = createSwaggerOptions({ certificate: 'certificate' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.post_console_organizations__orgId__integrations_entp',
    sdkFunctionName: 'createEnterpriseIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ENTERPRISE_INTEGRATION
  })
})

test('createAdobeIdIntegration', async () => {
  const sdkArgs = ['organizationId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.post_console_organizations__orgId__integrations_adobeId',
    sdkFunctionName: 'createAdobeIdIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ADOBEID_INTEGRATION
  })
})

test('updateAdobeIdIntegration', async () => {
  const sdkArgs = ['organizationId', 'integrationId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.put_console_organizations__orgId__integrations_adobeId',
    sdkFunctionName: 'updateAdobeIdIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_UPDATE_ADOBEID_INTEGRATION
  })
})

test('subscribeAdobeIdIntegrationToServices', async () => {
  const sdkArgs = ['organizationId', 'integrationId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.put_console_organizations__orgId__integrations_adobeid__intId__services',
    sdkFunctionName: 'subscribeAdobeIdIntegrationToServices',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_SUBSCRIBE_ADOBEID_INTEGRATION_TO_SERVICES
  })
})

test('subscribeEnterpriseIntegrationToServices', async () => {
  const sdkArgs = ['organizationId', 'integrationId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.put_console_organizations__orgId__integrations_entp__intId__services',
    sdkFunctionName: 'subscribeEnterpriseIntegrationToServices',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_SUBSCRIBE_ENTERPRISE_INTEGRATION_TO_SERVICES
  })
})

test('getBindingsForIntegration', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__integrations_entp__intId__bindings',
    sdkFunctionName: 'getBindingsForIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_BINDINGS_FOR_INTEGRATION
  })
})

test('uploadAndBindCertificate', async () => {
  const sdkArgs = ['organizationId', 'integrationId', 'certificate']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions({ certificate: 'certificate' })

  await standardTest({
    fullyQualifiedApiName: 'Organizations.post_console_organizations__orgId__integrations_entp__intId__bindings',
    sdkFunctionName: 'uploadAndBindCertificate',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_UPLOAD_AND_BIND_CERTIFICATE
  })
})

test('deleteBinding', async () => {
  const sdkArgs = ['organizationId', 'integrationId', 'bindingId']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId',
    bindingId: 'bindingId'

  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.delete_console_organizations__orgId__integrations_entp__intId__bindings__bindingId_',
    sdkFunctionName: 'deleteBinding',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DELETE_BINDING
  })
})

test('getIntegration', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__integrations__intId_',
    sdkFunctionName: 'getIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_INTEGRATION
  })
})

test('getIntegrationSecrets', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__integrations__intId__secrets',
    sdkFunctionName: 'getIntegrationSecrets',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_INTEGRATION_SECRETS
  })
})

test('deleteIntegration', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.delete_console_organizations__orgId__integrations__intId_',
    sdkFunctionName: 'deleteIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DELETE_INTEGRATION
  })
})

test('createIMSOrg', async () => {
  const sdkArgs = []
  const apiParameters = { }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.post_console_organizations',
    sdkFunctionName: 'createIMSOrg',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_IMS_ORG
  })
})

test('getAtlasApplicationPolicy', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = { orgId: 'organizationId', intId: 'integrationId' }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'AtlasPolicyEngine.get_console_organizations__orgId__policy__intId_',
    sdkFunctionName: 'getAtlasApplicationPolicy',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ATLAS_APPLICATION_POLICY
  })
})

test('getAtlasQuotaUsage', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = { orgId: 'organizationId', intId: 'integrationId' }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'AtlasPolicyEngine.get_console_organizations__orgId__policy__intId__usage',
    sdkFunctionName: 'getAtlasQuotaUsage',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ATLAS_QUOTA_USAGE
  })
})

test('getSDKProperties', async () => {
  const sdkArgs = ['organizationId', 'integrationId', 'sdkCode']

  const apiParameters = {
    orgId: 'organizationId',
    intId: 'integrationId',
    sdkCode: 'sdkCode'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.get_console_organizations__orgId__integrations_entp__intId__service__sdkCode__properties',
    sdkFunctionName: 'getSDKProperties',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_SDK_PROPERTIES
  })
})

test('getAllExtensionPoints default xp Id', async () => {
  const sdkArgs = ['organizationId', 'firefly']
  const apiParameters = {
    orgId: 'organizationId',
    xpId: 'firefly'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Extensions.get_console_organizations__orgId__xp__xpId_',
    sdkFunctionName: 'getAllExtensionPoints',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ALL_EXTENSIONPOINTS
  })
})

test('getAllExtensionPoints no xp Id', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = {
    orgId: 'organizationId',
    xpId: 'firefly'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Extensions.get_console_organizations__orgId__xp__xpId_',
    sdkFunctionName: 'getAllExtensionPoints',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ALL_EXTENSIONPOINTS
  })
})

test('getAllExtensionPoints using xp Id', async () => {
  const sdkArgs = ['organizationId', 'testXP']
  const apiParameters = {
    orgId: 'organizationId',
    xpId: 'testXP'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Extensions.get_console_organizations__orgId__xp__xpId_',
    sdkFunctionName: 'getAllExtensionPoints',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ALL_EXTENSIONPOINTS
  })
})

test('getAllExtensionPoints using appId', async () => {
  const sdkArgs = ['organizationId', 'appId']
  const apiParameters = {
    orgId: 'organizationId',
    appId: 'appId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Extensions.get_console_organizations__orgId__xr_api_v1_app',
    sdkFunctionName: 'getApplicationExtensions',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_APPLICATION_EXTENSIONS
  })
})

test('getEndPointsInWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Extensions.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__endpoints',
    sdkFunctionName: 'getEndPointsInWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_WORKSPACE_ENDPOINTS
  })
})

test('updateEndPointsInWorkspace', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', { some: 'body' }]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({ some: 'body' })

  await standardTest({
    fullyQualifiedApiName: 'Extensions.put_console_organizations__orgId__projects__projectId__workspaces__workspaceId__endpoints',
    sdkFunctionName: 'updateEndPointsInWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_UPDATE_WORKSPACE_ENDPOINTS
  })
})

test('getDevTerms', async () => {
  const sdkArgs = []
  const apiParameters = {}
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'DevTerms.get_console_services_ims_terms',
    sdkFunctionName: 'getDevTerms',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_DEV_TERMS
  })
})

test('acceptOrgDevTerms', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = {
    orgId: 'organizationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'DevTerms.post_console_services_ims_organizations__orgId__terms',
    sdkFunctionName: 'acceptOrgDevTerms',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_POST_DEV_TERMS_ACCEPTANCE
  })
})

test('checkOrgDevTerms', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = {
    orgId: 'organizationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'DevTerms.get_console_services_ims_organizations__orgId__terms',
    sdkFunctionName: 'checkOrgDevTerms',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_DEV_TERMS_ACCEPTANCE
  })
})
