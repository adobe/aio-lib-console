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

/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "standardTest"] }] */
// /////////////////////////////////////////////

const gApiKey = 'test-apikey'
const gAccessToken = 'test-token'
// /////////////////////////////////////////////

const createSwaggerOptions = (body) => {
  return {
    requestBody: body,
    serverVariables: {
      APISERVER: 'developers'
    }
  }
}

const createSdkClient = async (accessToken = gAccessToken, apiKey = gApiKey) => {
  return sdk.init(accessToken, apiKey)
}

// /////////////////////////////////////////////

beforeEach(() => {
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

/** @private */
async function standardTest ({
  fullyQualifiedApiName, apiParameters, apiOptions,
  sdkFunctionName, sdkArgs,
  successReturnValue = { body: {} },
  ErrorClass
}) {
  const sdkClient = await createSdkClient()
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
    expect(mockFn).toHaveBeenCalledWith(apiParameters)
  } else {
    expect(mockFn).toHaveBeenCalledWith(apiParameters, expect.objectContaining({ requestBody: apiOptions.requestBody }))
  }

  // failure case
  const err = new Error('some API error')
  mockFn = sdkClient.sdk.mockRejected(fullyQualifiedApiName, err)
  await expect(fn.apply(sdkClient, sdkArgs)).rejects.toEqual(
    new ErrorClass({ sdkDetails: { ...sdkArgs }, messageValues: err })
  )
  if (typeof (apiOptions) === 'object' && Object.keys(apiOptions).length === 0) {
    expect(mockFn).toHaveBeenCalledWith(apiParameters)
  } else {
    expect(mockFn).toHaveBeenCalledWith(apiParameters, expect.objectContaining(apiOptions))
  }
}

test('getProjectsForOrg', async () => {
  const sdkArgs = ['organizationId']
  const apiParameters = { orgId: 'organizationId' }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'projects.getProjectsByOrgId',
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
    fullyQualifiedApiName: 'projects.createProject',
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
    fullyQualifiedApiName: 'projects.createProject',
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
    fullyQualifiedApiName: 'projects.getWorkspacesByProjectId',
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
    fullyQualifiedApiName: 'projects.deleteProject',
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
    fullyQualifiedApiName: 'projects.editProject',
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
    fullyQualifiedApiName: 'projects.getProjectById',
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
    fullyQualifiedApiName: 'workspaces.downloadWorkspaceJSON',
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
    fullyQualifiedApiName: 'workspaces.createWorkspace',
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
    fullyQualifiedApiName: 'workspaces.editWorkspace',
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
    fullyQualifiedApiName: 'workspaces.getWorkspaceById',
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
    fullyQualifiedApiName: 'workspaces.deleteWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    successReturnValue: { body: true, ok: true },
    ErrorClass: codes.ERROR_DELETE_WORKSPACE
  })
})

test('getIntegrations', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.getIntegrations',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_INTEGRATIONS
  })
})

test('createEnterpriseIntegration', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'certificate', 'name', 'description']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({ certificate: 'certificate', description: 'description', name: 'name' })

  await standardTest({
    fullyQualifiedApiName: 'workspaces.createEnterpriseIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ENTERPRISE_INTEGRATION
  })
})

test('createAdobeIdIntegration', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.createAdobeIdIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_CREATE_ADOBEID_INTEGRATION
  })
})

test('subscribeIntegrationToServices', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'integrationType', 'integrationId', {}]
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId',
    integrationType: 'integrationType',
    integrationId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions({})

  await standardTest({
    fullyQualifiedApiName: 'workspaces.subscribeIntegrationToServices',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_SUBSCRIBE_INTEGRATION_TO_SERVICES
  })
})

test('getWorkspaceForIntegration', async () => {
  const sdkArgs = ['organizationId', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    integrationId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.getProjectWorkspaceByIntegration',
    sdkFunctionName: 'getWorkspaceForIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECT_WORKSPACE_BY_INTEGRATION
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
    fullyQualifiedApiName: 'workspaces.getProjectByWorkspace',
    sdkFunctionName: 'getProjectForWorkspace',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_PROJECT_BY_WORKSPACE
  })
})

test('deleteIntegration', async () => {
  const sdkArgs = ['organizationId', 'projectId', 'workspaceId', 'integrationType', 'integrationId']
  const apiParameters = {
    orgId: 'organizationId',
    projectId: 'projectId',
    workspaceId: 'workspaceId',
    integrationType: 'integrationType',
    integrationId: 'integrationId'
  }
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'workspaces.deleteIntegration',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_DELETE_INTEGRATION
  })
})

test('getOrganizations', async () => {
  const sdkArgs = []
  const apiParameters = {}
  const apiOptions = createSwaggerOptions()

  await standardTest({
    fullyQualifiedApiName: 'Organizations.getOrganizations',
    apiParameters,
    apiOptions,
    sdkArgs,
    ErrorClass: codes.ERROR_GET_ORGANIZATIONS
  })
})
