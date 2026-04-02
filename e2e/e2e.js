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

// Issues to keep track that will affect these tests:
// IOC-10064 Transporter API: list organizations does not return 403 on a bad api key
// IOC-10065 Transporter API: create workspace returns HTTP 200 instead of 201
// IOC-10066 Transporter API: edit workspace - incorrect required parameters
// IOC-10068 Transporter API: create workspace - runtime_enabled property is not documented
// The trailing/leading spaces tests for project/workspace names and titles - tickets are pending (to define exact behavior)

const sdk = require('../src')

// VARS ////////////////////////////

// these ids will be assigned when creating the project and workspace dynamically for the test
// const { sdkClient, orgId, apiKey, accessToken, env, findSDKCode } = global
let fireflyProjectId, projectId, defaultWorkspaceId, workspaceId, fireflyWorkspaceId

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
const credentialNameOAuthS2S = 'cred-oauths2s' + ts
const fireflyProjectTitle = 'E2ETestFireflyProjectTitle' + ts
const defaultProjectTitle = 'E2ETestProjectTitle' + ts
const modifiedFireflyProjectTitle = 'mod' + fireflyProjectTitle
const modifiedDefaultProjectTitle = 'mod' + defaultProjectTitle

// LIFECYCLE ////////////////////////////

afterAll(async () => {
  // Best-effort cleanup: delete projects created during the test run.
  // These deletes are also performed in the final describe block, but this
  // ensures cleanup even if the suite aborts before reaching those tests.
  const deleteIfDefined = async (projectId, label) => {
    if (!projectId || !global.orgId) {
      return
    }

    try {
      console.log(`Cleaning up ${label} with id ${projectId}...`)
      await global.sdkClient.deleteProject(global.orgId, projectId)
      console.log(`Project ${label} deleted.`)
    } catch (e) {
      console.log(`Project ${label}(${projectId}) was not deleted (best effort basis).`)
    }
  }
  await deleteIfDefined(projectId, 'default project')
  await deleteIfDefined(fireflyProjectId, 'firefly project')
})

// TESTS ////////////////////////////

describe('init and input checks', () => {
  test('sdk init test', async () => {
    expect(global.sdkClient).toBeDefined()
    expect(global.sdkClient.apiKey).toBe(global.apiKey)
    expect(global.sdkClient.accessToken).toBe(global.accessToken)
    expect(['prod', 'stage']).toContain(global.sdkClient.env)
  })

  test('bad access token', async () => {
    const _sdkClient = await sdk.init('bad_access_token', global.apiKey, global.sdkClient.env)
    const promise = _sdkClient.getOrganizations()
    return expect(promise).rejects.toThrow('401')
  })

  test('bad api key', async () => {
    const _sdkClient = await sdk.init(global.accessToken, 'bad_api_key', global.env)
    const promise = _sdkClient.getOrganizations()
    return expect(promise).rejects.toThrow('403')
  })
})

describe('organizations', () => {
  test('getOrganizations API', async () => {
    const res = await global.sdkClient.getOrganizations()
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'roles', 'type', 'description', 'id']))
  })

  test('getProjectsForOrg API', async () => {
    expect(global.orgId).toBeDefined()

    const res = await global.sdkClient.getProjectsForOrg(global.orgId)
    expect(res.ok).toBe(true)
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'org_id', 'who_created', 'description', 'id']))
  })
})

describe('create, edit, get', () => {
  let fireflyAppId

  test('createFireflyProject API', async () => {
    expect(global.orgId).toBeDefined()

    const res = await global.sdkClient.createFireflyProject(global.orgId, { name: fireflyProjectName, title: fireflyProjectTitle, description: projectDescription })
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

  test('createProject API (default project type)', async () => {
    expect(global.orgId).toBeDefined()

    const projectType = 'default'
    const res = await global.sdkClient.createProject(global.orgId, { name: projectName, title: defaultProjectTitle, description: projectDescription, type: projectType })
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

  test('editProject API (default project type)', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await global.sdkClient.editProject(global.orgId, projectId, { name: projectName, description: modifiedProjectDescription, title: modifiedDefaultProjectTitle, type: 'default' })
    global.expectOkResponse(res)
    expect(res.body.description).toEqual(modifiedProjectDescription)
    expect(res.body.title).toEqual(modifiedDefaultProjectTitle)
    expect(res.body.id).toEqual(projectId)
  })

  test('editProject API for firefly project', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()

    const res = await global.sdkClient.editProject(
      global.orgId,
      fireflyProjectId,
      { name: fireflyProjectName, description: modifiedProjectDescription, title: modifiedFireflyProjectTitle, type: 'jaeger' }
    )
    global.expectOkResponse(res)
    expect(res.body.description).toEqual(modifiedProjectDescription)
    expect(res.body.title).toEqual(modifiedFireflyProjectTitle)
    expect(res.body.id).toEqual(fireflyProjectId)
  })

  test('getProject API (default type)', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await global.sdkClient.getProject(global.orgId, projectId)
    global.expectOkResponse(res)
    expect(res.body.name).toEqual(projectName)
    expect(res.body.appId).toBeFalsy()
    expect(res.body.id).toEqual(projectId)
  })

  test('getProject API (firefly project type)', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()

    const res = await global.sdkClient.getProject(global.orgId, fireflyProjectId)
    global.expectOkResponse(res)
    expect(res.body.name).toEqual(fireflyProjectName)
    expect(res.body.appId).toBeTruthy()
    expect(res.body.id).toEqual(fireflyProjectId)
    expect(res.body.description).toEqual(modifiedProjectDescription)
    fireflyAppId = res.body.appId
  })

  test('getApplicationExtensions', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyAppId).toBeDefined()

    const res = await global.sdkClient.getApplicationExtensions(global.orgId, fireflyAppId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })

  test('createWorkspace API for default project type - should fail because only one is allowed for a default project', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(defaultWorkspaceId).toBeDefined()

    const res = global.sdkClient.createWorkspace(global.orgId, projectId, { name: workspaceName, description: workspaceDescription })
    await expect(res).rejects.toThrow('Only one workspace allowed for project type default')
  })

  /*  This is required because "Only one workspace allowed for project type default" */
  test('deleteWorkspace API for default project type (to delete the default workspace)', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(defaultWorkspaceId).toBeDefined()

    const res = await global.sdkClient.deleteWorkspace(global.orgId, projectId, defaultWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('createWorkspace API for default project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()

    const res = await global.sdkClient.createWorkspace(global.orgId, projectId, { name: workspaceName, description: workspaceDescription })
    global.expectOkResponse(res)
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(projectId)
    workspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + workspaceId)
  })

  test('createWorkspace API for firefly project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    const res = await global.sdkClient.createWorkspace(global.orgId, fireflyProjectId, { name: fireflyWorkspaceName, title: 'workspace title', description: workspaceDescription })
    global.expectOkResponse(res)
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(fireflyProjectId)
    fireflyWorkspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + fireflyWorkspaceId)
  })

  test('update endpoints for workspace API', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const endpoints = {
      endpoints: {
        'dx/excshell/1': {
          view: {
            href: 'https://teste2e.adobeio-static.net/updatedapp-0.0.1/index.html'
          }
        }
      }
    }
    const res = await global.sdkClient.updateEndPointsInWorkspace(global.orgId, fireflyProjectId, fireflyWorkspaceId, endpoints)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })

  test('get endpoints for workspace API', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await global.sdkClient.getEndPointsInWorkspace(global.orgId, fireflyProjectId, fireflyWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })

  test('getWorkspacesForProject API for firefly project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await global.sdkClient.getWorkspacesForProject(global.orgId, fireflyProjectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'title', 'description', 'id']))
    const workspaceNames = res.body.map(x => x.name)
    expect(workspaceNames).toEqual(expect.arrayContaining(['Production', fireflyWorkspaceName])) // no Stage workspace by default
    expect(res.body.map(x => x.id)).toEqual(expect.arrayContaining([fireflyWorkspaceId]))
  })

  test('getWorkspacesForProject API for default project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.getWorkspacesForProject(global.orgId, projectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(Array.isArray(res.body)).toBe(true)
    expect(Object.keys(res.body[0])).toEqual(expect.arrayContaining(['name', 'title', 'description', 'id']))
    expect(res.body[0].name).toEqual(workspaceName)
    expect(res.body[0].id).toEqual(workspaceId)
  })

  test('editWorkspace API for default project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.editWorkspace(global.orgId, projectId, workspaceId, { name: workspaceName, title: defaultProjectTitle, description: modifiedWorkspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(res.body.description).toBe(modifiedWorkspaceDescription)
  })

  test('editWorkspace API for firefly project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await global.sdkClient.editWorkspace(global.orgId, fireflyProjectId, fireflyWorkspaceId, { name: fireflyWorkspaceName, title: fireflyProjectTitle, description: modifiedWorkspaceDescription })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
    expect(res.body.description).toBe(modifiedWorkspaceDescription)
  })

  test('getWorkspace API for default project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.getWorkspace(global.orgId, projectId, workspaceId)
    global.expectOkResponse(res)
    expect(res.body.description).toEqual(modifiedWorkspaceDescription)
    expect(res.body.id).toEqual(workspaceId)
  })

  test('getWorkspace API for firefly project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await global.sdkClient.getWorkspace(global.orgId, fireflyProjectId, fireflyWorkspaceId)
    global.expectOkResponse(res)
    expect(res.body.description).toEqual(modifiedWorkspaceDescription)
    expect(res.body.id).toEqual(fireflyWorkspaceId)
  })

  test('getProjectForWorkspace API for default project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.getProjectForWorkspace(global.orgId, workspaceId)
    global.expectOkResponse(res)
    expect(res.body.projectId).toEqual(projectId)
    expect(res.body.workspaceId).toEqual(workspaceId)
  })

  test('getProjectForWorkspace API for firefly project type', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(fireflyWorkspaceId).toBeDefined()

    const res = await global.sdkClient.getProjectForWorkspace(global.orgId, fireflyWorkspaceId)
    global.expectOkResponse(res)
    expect(res.body.projectId).toEqual(fireflyProjectId)
    expect(res.body.workspaceId).toEqual(fireflyWorkspaceId)
  })
})

describe('Workspace credential test', () => {
  describe('AdobeID credentials', () => {
    let credentialId

    test('createAdobeIdCredential API', async () => {
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.createAdobeIdCredential(global.orgId, projectId, workspaceId, { name: credentialNameAdobeId, description: 'testing ng console api', platform: 'WebApp', redirectUriList: ['https://google.com'], defaultRedirectUri: 'https://google.com' })
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      credentialId = res.body.id
      console.log('OAuth integration created with Id: ', credentialId)
    })

    test('getCredentials API (oauthweb)', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
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
      expect(res.body[0].flow_type).toEqual('adobeid')
      expect(res.body[0].integration_type).toEqual('oauthwebapp')
    })

    test('getWorkspaceForCredential API', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.getWorkspaceForCredential(global.orgId, credentialId)
      global.expectOkResponse(res)
      expect(res.body.projectId).toEqual(projectId)
      expect(res.body.workspaceId).toEqual(workspaceId)
    })

    // organization integration APIs on workspace credentials
    test('getIntegration API', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()
      const res = await global.sdkClient.getIntegration(global.orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.body.id).toEqual(credentialId)
      expect(res.body.orgId).toEqual(global.orgId)
      expect(res.body.name).toEqual(credentialNameAdobeId)
      expect(res.body.type).toEqual('adobeid')
    })

    test('getIntegrationSecrets API', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()
      const res = await global.sdkClient.getIntegrationSecrets(global.orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof res.body).toBe('object')
      expect(res.body.client_id).toBeDefined()
      expect(res.body.client_secrets).toBeDefined()
    })

    // delete
    test('deleteCredential API (integrationType: adobeid)', async () => {
      expect(credentialId).toBeDefined() // if not, createAdobeIdCredential test failed
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.deleteCredential(global.orgId, projectId, workspaceId, 'adobeid', credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  describe('OAuth Server-to-Server credentials', () => {
    let credentialId

    test('createOAuthServerToServerCredential API', async () => {
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.createOAuthServerToServerCredential(global.orgId, projectId, workspaceId, credentialNameOAuthS2S, 'just a desc')
      expect(typeof (res.body)).toBe('object')
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'apiKey', 'orgId']))
      credentialId = res.body.id
      console.log('OAuth-Server-to-Server integration created with Id: ', credentialId)
    })

    test('getCredentials API (service)', async () => {
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
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
      expect(res.body[0].flow_type).toEqual('entp')
      expect(res.body[0].integration_type).toEqual('oauth_server_to_server')
    })

    test('subscribeOAuthServerToServerIntegrationToServices API (AdobeIOManagementAPISDK)', async () => {
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
      expect(global.orgId).toBeDefined()

      const sdkCode = global.findSDKCode('I/O Management API')
      const res = await global.sdkClient.subscribeOAuthServerToServerIntegrationToServices(global.orgId, credentialId, [
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
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.downloadWorkspaceJson(global.orgId, projectId, workspaceId)
      global.expectOkResponse(res)
      expect(res.body.project.id).toEqual(projectId)
      expect(res.body.project.workspace.id).toEqual(workspaceId)
      expect(Array.isArray(res.body.project.workspace.details.credentials)).toBe(true)
      expect(res.body.project.workspace.details.credentials[0].id).toEqual(credentialId)
      expect(res.body.project.workspace.details.credentials[0].integration_type).toEqual('oauth_server_to_server')
      expect(Array.isArray(res.body.project.workspace.details.services)).toBe(true)
      expect(typeof (res.body.project.workspace.details.runtime)).toBe('object')
    })

    // organization integration APIs on workspace credentials

    test('getIntegration API', async () => {
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
      expect(global.orgId).toBeDefined()
      const res = await global.sdkClient.getIntegration(global.orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.body.id).toEqual(credentialId)
      expect(res.body.orgId).toEqual(global.orgId)
      expect(res.body.name).toEqual(credentialNameOAuthS2S)
      expect(res.body.type).toEqual('entp')
    })

    test('getIntegrationSecrets API', async () => {
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
      expect(global.orgId).toBeDefined()
      const res = await global.sdkClient.getIntegrationSecrets(global.orgId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(typeof res.body).toBe('object')
      expect(res.body.client_id).toBeDefined()
      expect(res.body.client_secrets).toBeDefined()
    })

    // delete
    test('deleteCredential API (integrationType: oauth_server_to_server)', async () => {
      expect(credentialId).toBeDefined() // if not, createOAuthServerToServerCredential test failed
      expect(global.orgId).toBeDefined()
      expect(projectId).toBeDefined()
      expect(workspaceId).toBeDefined()

      const res = await global.sdkClient.deleteCredentialById(global.orgId, projectId, workspaceId, credentialId)
      expect(res.ok).toBe(true)
      expect(res.status).toBe(200)
      expect(res.statusText).toBe('OK')
    })
  })

  // missing analytics credentials tests
})

describe('Extension API tests', () => {
  test('getAllExtensionPoints', async () => {
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.getAllExtensionPoints(global.orgId, 'firefly')
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
  })
})

describe('dev terms', () => {
  test('get dev terms', async () => {
    const res = await global.sdkClient.getDevTerms()
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
  test('check dev terms', async () => {
    expect(global.orgId).toBeDefined()

    const res = await global.sdkClient.checkOrgDevTerms(global.orgId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
  test('accept dev terms', async () => {
    expect(global.orgId).toBeDefined()
    const res = await global.sdkClient.acceptOrgDevTerms(global.orgId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })
})

describe('create, edit, get, delete: test trailing spaces', () => {
  let trailingProjectId, trailingWorkspaceId
  const trailingProjectName = 't' + fireflyProjectName
  const trailingWorkspaceName = 't' + fireflyWorkspaceName

  test('trailing spaces for firefly project', async () => {
    expect(global.orgId).toBeDefined()

    const projectDescriptionWithTrailingSpaces = ` ${projectDescription} `
    const projectTitle = fireflyProjectTitle
    const projectTitleWithTrailingSpaces = ` ${projectTitle} `

    const res = await global.sdkClient.createFireflyProject(global.orgId, { name: trailingProjectName, title: projectTitleWithTrailingSpaces, description: projectDescriptionWithTrailingSpaces })
    expect(res.ok).toBe(true)
    expect(res.status).toBe(201)
    expect(res.statusText).toBe('Created')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['runtime', 'projectId', 'appId', 'workspaces', 'projectType']))
    expect(Array.isArray(res.body.workspaces)).toBe(true)
    expect(res.body.workspaces[0].workspaceId).toBeDefined()
    trailingProjectId = res.body.projectId
    console.log('Firefly Project created with Id: ' + trailingProjectId)
  })

  test('trailing spaces for firefly workspace', async () => {
    expect(global.orgId).toBeDefined()
    expect(trailingProjectId).toBeDefined()

    const workspaceTitle = fireflyWorkspaceName
    const workspaceTitleWithTrailingSpaces = ` ${workspaceTitle} `
    const workspaceDescriptionWithTrailingSpaces = ` ${workspaceDescription} `

    let res = await global.sdkClient.createWorkspace(global.orgId, trailingProjectId, { name: trailingWorkspaceName, title: workspaceTitleWithTrailingSpaces, description: workspaceDescriptionWithTrailingSpaces })
    expect(res.ok).toBe(true)
    // TODO: decide if it should be 200 or 201 for create workspace api and align with that in sdk and tests
    expect(res.status).toBe(200)
    // TODO: decide if it should be 'OK' or 'Created' for create workspace api and align with that in sdk and tests
    // expect(res.statusText).toBe('Created')
    expect(res.statusText).toBe('OK')
    expect(typeof (res.body)).toBe('object')
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['projectId', 'workspaceId']))
    expect(res.body.projectId).toEqual(trailingProjectId)
    trailingWorkspaceId = res.body.workspaceId
    console.log('Workspace created with Id: ' + trailingWorkspaceId)

    // ! trailing spaces are not removed when get or edit

    res = await global.sdkClient.getWorkspace(global.orgId, trailingProjectId, trailingWorkspaceId)
    expect(res.body.title).toEqual(workspaceTitleWithTrailingSpaces)
    expect(res.body.description).toEqual(workspaceDescriptionWithTrailingSpaces)

    const titleWithTrailingSpaces = ' some other title '
    res = await global.sdkClient.editWorkspace(global.orgId, trailingProjectId, trailingWorkspaceId, { name: trailingWorkspaceName, title: titleWithTrailingSpaces, description: ` ${modifiedWorkspaceDescription} ` })
    expect(res.body.title).toEqual(titleWithTrailingSpaces)
    expect(res.body.description).toEqual(` ${modifiedWorkspaceDescription} `)
  })

  test('delete project and workspace with trailing spaces', async () => {
    expect(global.orgId).toBeDefined()
    expect(trailingProjectId).toBeDefined()
    expect(trailingWorkspaceId).toBeDefined()

    const res = await global.sdkClient.deleteWorkspace(global.orgId, trailingProjectId, trailingWorkspaceId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')

    const prjRes = await global.sdkClient.deleteProject(global.orgId, trailingProjectId)
    expect(prjRes.ok).toBe(true)
    expect(prjRes.status).toBe(200)
    expect(prjRes.statusText).toBe('OK')
  })

  test('deleteProject API (default type)', async () => {
    expect(global.orgId).toBeDefined()
    expect(projectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const res = await global.sdkClient.deleteProject(global.orgId, projectId)
    expect(res.ok).toBe(true)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe('OK')
  })

  test('deleteProject API (firefly project template)', async () => {
    expect(global.orgId).toBeDefined()
    expect(fireflyProjectId).toBeDefined()
    expect(workspaceId).toBeDefined()

    const prjRes = await global.sdkClient.deleteProject(global.orgId, fireflyProjectId)
    expect(prjRes.ok).toBe(true)
    expect(prjRes.status).toBe(200)
    expect(prjRes.statusText).toBe('OK')
  })
})
