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

const Swagger = require('swagger-client')
const loggerNamespace = '@adobe/aio-lib-console'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL })
const { reduceError } = require('./helpers')
const { codes } = require('./SDKErrors')
const fetch = require('node-fetch').default
const FormData = require('form-data')

/**
 * @typedef {object} ProjectDetails
 * @property {string} name Name
 * @property {string} title Title
 * @property {string} [who_created] Creator name
 * @property {string} description Description
 * @property {string} type Type
 */
/**
 * @typedef {object} WorkspaceDetails
 * @property {string} name Name
 * @property {string} [title] Title
 * @property {string} [who_created] Creator name
 * @property {string} description Description
 * @property {string} [type] Type
 * @property {string} [quotaRule] quotaRule
 */
/**
 * @typedef {object} IntegrationDetails
 * @property {string} name Name
 * @property {string} description Description
 * @property {string} [platform] Platform
 * @property {string} [urlScheme] url scheme
 * @property {object} [redirectUriList] List of redirect URIs
 * @property {string} [defaultRedirectUri] Default redirect URI
 * @property {string} [domain] domain
 * @property {object} [approvalInfo] approvalInfo
 */

const DEFAULT_ENVIRONMENT = 'prod'

const APISERVER = {
  prod: 'developers',
  stage: 'developers-stage'
}

/* global Response */ // for linter

/**
 * Returns a Promise that resolves with a new CoreConsoleAPI object
 *
 * @param {string} accessToken the access token corresponding to an integration or user token
 * @param {string} apiKey api key to access the Developer Console
 * @param {string} [env=prod] the server environment ('prod' or 'stage')
 * @returns {Promise<CoreConsoleAPI>} a Promise with a CoreConsoleAPI object
 */
function init (accessToken, apiKey, env = DEFAULT_ENVIRONMENT) {
  return new Promise((resolve, reject) => {
    const clientWrapper = new CoreConsoleAPI()

    clientWrapper.init(accessToken, apiKey, env)
      .then(initializedSDK => {
        logger.debug('sdk initialized successfully')
        resolve(initializedSDK)
      })
      .catch(err => {
        logger.debug(`sdk init error: ${err}`)
        reject(err)
      })
  })
}

/**
 * This class provides methods to call your CoreConsoleAPI APIs.
 * Before calling any method, initialize the instance by calling the `init` method on it
 * with valid values for apiKey and accessToken
 */
class CoreConsoleAPI {
  /**
   * Initializes a CoreConsoleAPI object and returns it
   *
   * @param {string} accessToken the access token corresponding to an integration or user token
   * @param {string} apiKey api key to access the Developer Console
   * @param {string} [env=prod] the server environment ('prod' or 'stage')
   * @returns {Promise<CoreConsoleAPI>} a CoreConsoleAPI object
   */
  async init (accessToken, apiKey, env) {
    const initErrors = []
    if (!accessToken) {
      initErrors.push('accessToken')
    }

    if (initErrors.length) {
      const sdkDetails = { accessToken }
      throw new codes.ERROR_SDK_INITIALIZATION({ sdkDetails, messageValues: `${initErrors.join(', ')}` })
    } else {
      // init swagger client
      const spec = require('../spec/api.json')
      const swagger = new Swagger({
        spec: spec,
        requestInterceptor: req => {
          this.__setHeaders(req, this)
        },
        usePromise: true
      })
      this.sdk = (await swagger)
    }

    this.apiKey = apiKey
    this.accessToken = accessToken
    this.env = env
    return this
  }

  /**
   * Get all Projects in an Organization
   *
   * @param {string} organizationId Organization ID
   * @returns {Promise<Response>} the response
   */
  getProjectsForOrg (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.getProjectsByOrgId(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_PROJECTS_BY_ORG_ID({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Create a new Project in an Organization
   *
   * @param {string} organizationId Organization ID
   * @param {ProjectDetails} projectDetails Project details including name, title, who_created, description and type
   * @returns {Promise<Response>} the response
   */
  createProject (organizationId, projectDetails) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.createProject(parameters, this.__createRequest(projectDetails))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_CREATE_PROJECT({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get all Workspaces for a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  getWorkspacesForProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId: projectId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.getWorkspacesByProjectId(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_WORKSPACES_BY_PROJECT_ID({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Delete a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  deleteProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.deleteProject(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_DELETE_PROJECT({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Edit a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {ProjectDetails} projectDetails Project details including name, title, who_created, description and type
   * @returns {Promise<Response>} the response
   */
  editProject (organizationId, projectId, projectDetails) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.editProject(parameters, this.__createRequest(projectDetails))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_EDIT_PROJECT({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get a Project by ID
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  getProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.projects.getProjectById(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_PROJECT_BY_ID({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Download the Workspace Configuration File (json)
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  downloadWorkspaceJson (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.downloadWorkspaceJSON(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_DOWNLOAD_WORKSPACE_JSON({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Create a new Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {WorkspaceDetails} workspaceDetails Workspace details including name, title, who_created, description, type and quotaRule
   * @returns {Promise<Response>} the response
   */
  createWorkspace (organizationId, projectId, workspaceDetails) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.createWorkspace(parameters, this.__createRequest(workspaceDetails))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_CREATE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Edit a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {WorkspaceDetails} workspaceDetails Workspace details including name, title, who_created, description, type and quotaRule
   * @returns {Promise<Response>} the response
   */
  editWorkspace (organizationId, projectId, workspaceId, workspaceDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.editWorkspace(parameters, this.__createRequest(workspaceDetails))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_EDIT_WORKSPACE({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get a Workspace by ID
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  getWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.getWorkspaceById(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_WORKSPACE_BY_ID({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Delete a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  deleteWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.deleteWorkspace(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_DELETE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get all Integrations for a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  getIntegrations (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.getIntegrations(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_INTEGRATIONS({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Create a new Enterprise Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {Buffer} certificate Certificate
   * @param {string} name Integration name
   * @param {string} description Integration description
   * @returns {Promise<Response>} the response
   */
  createEnterpriseIntegration (organizationId, projectId, workspaceId, certificate, name, description) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      // workaround due to swagger-client bug (see ACNA-716)
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('certificate', certificate, {
        contentType: 'application/x-x509-user-cert',
        name: 'file',
        filename: 'certificate_pub.crt'
      })

      const url = this.sdk.spec.servers[0].url
        .replace(/\/+$/, '') // remove any trailing forward slashes, if any
        .replace(/{APISERVER}/g, APISERVER[this.env]) // substitute for the right api server

      fetch(`${url}/organizations/${organizationId}/projects/${projectId}/workspaces/${workspaceId}/credentials/entp`, {
        method: 'POST',
        body: formData,
        headers: {
          'x-api-key': this.apiKey,
          Authorization: this.accessToken
        }
      })
        .then(res => {
          if (res.ok) {
            resolve(res.json())
          } else {
            reject(new codes.ERROR_CREATE_ENTERPRISE_INTEGRATION({ sdkDetails, messageValues: reduceError({ response: res }) }))
          }
        })
        .catch(err => {
          reject(new codes.ERROR_CREATE_ENTERPRISE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Create a new AdobeID Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {IntegrationDetails} integrationDetails Integration details
   * @returns {Promise<Response>} the response
   */
  createAdobeIdIntegration (organizationId, projectId, workspaceId, integrationDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.createAdobeIdIntegration(parameters, this.__createRequest(integrationDetails))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_CREATE_ADOBEID_INTEGRATION({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Subscribe an Integration to Services
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {string} integrationType Integration type (adobeid, analytics or entp)
   * @param {string} integrationId Integration ID
   * @param {object} serviceInfo Information about the services like SDK Codes, licenseConfig and roles
   * @returns {Promise<Response>} the response
   */
  subscribeIntegrationToServices (organizationId, projectId, workspaceId, integrationType, integrationId, serviceInfo) {
    const parameters = { orgId: organizationId, projectId, workspaceId, integrationType, integrationId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.subscribeIntegrationToServices(parameters, this.__createRequest(serviceInfo))
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_SUBSCRIBE_INTEGRATION_TO_SERVICES({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get the Workspace for an Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  getWorkspaceForIntegration (organizationId, integrationId) {
    const parameters = { orgId: organizationId, integrationId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.getProjectWorkspaceByIntegration(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_PROJECT_WORKSPACE_BY_INTEGRATION({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get the Project of a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  getProjectForWorkspace (organizationId, workspaceId) {
    const parameters = { orgId: organizationId, workspaceId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.getProjectByWorkspace(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_PROJECT_BY_WORKSPACE({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Delete an Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {string} integrationType Integration type (adobeid, analytics or entp)
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  deleteIntegration (organizationId, projectId, workspaceId, integrationType, integrationId) {
    const parameters = { orgId: organizationId, projectId, workspaceId, integrationType, integrationId }
    const sdkDetails = { parameters }

    return new Promise((resolve, reject) => {
      this.sdk.apis.workspaces.deleteIntegration(parameters, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_DELETE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /**
   * Get all Organizations
   *
   * @returns {Promise<Response>} the response
   */
  getOrganizations () {
    const sdkDetails = {}

    return new Promise((resolve, reject) => {
      this.sdk.apis.Organizations.getOrganizations({}, this.__createRequest())
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          reject(new codes.ERROR_GET_ORGANIZATIONS({ sdkDetails, messageValues: reduceError(err) }))
        })
    })
  }

  /** @private */
  __createRequest (body = {}) {
    console.log('ENV', this.env, APISERVER[this.env])
    return {
      requestBody: body,
      serverVariables: {
        APISERVER: APISERVER[this.env]
      }
    }
  }

  /** @private */
  __setHeaders (req, coreAPIInstance) {
    req.headers.Authorization = 'Bearer ' + coreAPIInstance.accessToken
    if (!req.headers['x-api-key'] && coreAPIInstance.apiKey) {
      req.headers['x-api-key'] = coreAPIInstance.apiKey
    }
    req.headers['Content-Type'] = req.headers['Content-Type'] || 'application/json'
  }
}

module.exports = {
  init: init
}
