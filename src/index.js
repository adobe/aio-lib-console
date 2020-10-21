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
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL || 'debug' })
const { reduceError, requestInterceptorBuilder, responseInterceptor, createRequestOptions } = require('./helpers')
const { codes } = require('./SDKErrors')

/**
 * @typedef {object} ProjectDetails
 * @property {string} name Name
 * @property {string} title Title
 * @property {string} [who_created] Creator name
 * @property {string} description Description
 * @property {string} type Type (default or jaeger)
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

const API_HOST = {
  prod: 'developers.adobe.io',
  stage: 'developers-stage.adobe.io'
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
        requestInterceptor: requestInterceptorBuilder(this, API_HOST[env]),
        responseInterceptor,
        usePromise: true
      })
      /** @private */
      this.sdk = (await swagger)
    }
    /** @private */
    this.apiKey = apiKey
    /** @private */
    this.accessToken = accessToken
    /** @private */
    this.env = env
    return this
  }

  /**
   * Get all Projects in an Organization
   *
   * @param {string} organizationId Organization ID
   * @returns {Promise<Response>} the response
   */
  async getProjectsForOrg (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects.get_console_organizations__orgId__projects(...this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECTS_BY_ORG_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Firefly Project (from template) in an Organization
   *
   * @param {string} organizationId Organization ID
   * @param {ProjectDetails} projectDetails Project details including name, title, who_created, description and type
   * @returns {Promise<Response>} the response
   */
  createFireflyProject (organizationId, projectDetails) {
    projectDetails.type = 'jaeger'
    return this.createProject(organizationId, projectDetails)
  }

  /**
   * Create a new Project in an Organization
   *
   * @param {string} organizationId Organization ID
   * @param {ProjectDetails} projectDetails Project details including name, title, who_created, description and type
   * @returns {Promise<Response>} the response
   */
  async createProject (organizationId, projectDetails) {
    const parameters = { orgId: organizationId }
    const requestBody = projectDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects.post_console_organizations__orgId__projects(...this.__createRequestOptions(parameters, requestBody))
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_PROJECT({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all Workspaces for a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspacesForProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId: projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(...this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_WORKSPACES_BY_PROJECT_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async deleteProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .delete_console_organizations__orgId__projects__projectId_(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_PROJECT({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Edit a Project
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {ProjectDetails} projectDetails Project details including name, title, who_created, description and type
   * @returns {Promise<Response>} the response
   */
  async editProject (organizationId, projectId, projectDetails) {
    const parameters = { orgId: organizationId, projectId }
    const requestBody = projectDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .patch_console_organizations__orgId__projects__projectId_(this.__createRequestOptions(parameters, requestBody))
      return res
    } catch (err) {
      throw new codes.ERROR_EDIT_PROJECT({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get a Project by ID
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async getProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId_(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_BY_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Download the Workspace Configuration File (json)
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async downloadWorkspaceJson (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__download(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_DOWNLOAD_WORKSPACE_JSON({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {WorkspaceDetails} workspaceDetails Workspace details including name, title, who_created, description, type and quotaRule
   * @returns {Promise<Response>} the response
   */
  async createWorkspace (organizationId, projectId, workspaceDetails) {
    const parameters = { orgId: organizationId, projectId }
    const requestBody = workspaceDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__download(this.__createRequestOptions(parameters, requestBody))
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
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
  async editWorkspace (organizationId, projectId, workspaceId, workspaceDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = workspaceDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .patch_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(this.__createRequestOptions(parameters, requestBody))
      return res
    } catch (err) {
      throw new codes.ERROR_EDIT_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get a Workspace by ID
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_WORKSPACE_BY_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async deleteWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all Integrations for a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getIntegrations (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_INTEGRATIONS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Enterprise Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {object} certificate A Readable stream with certificate content. eg: fs.createReadStream()
   * @param {string} name Integration name
   * @param {string} description Integration description
   * @returns {Promise<Response>} the response
   */
  async createEnterpriseIntegration (organizationId, projectId, workspaceId, certificate, name, description) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = { certificate, name, description }
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_entp(
          this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ENTERPRISE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
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
  async createAdobeIdIntegration (organizationId, projectId, workspaceId, integrationDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = integrationDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_adobeId(
          this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ADOBEID_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
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
  async subscribeIntegrationToServices (organizationId, projectId, workspaceId, integrationType, integrationId, serviceInfo) {
    const parameters = { orgId: organizationId, projectId, workspaceId, integrationType, integrationId }
    const requestBody = serviceInfo
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.projects
        .put_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__integrationType___credentialId__services(
          this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_SUBSCRIBE_INTEGRATION_TO_SERVICES({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get the Workspace for an Integration
   *
   * @param {string} organizationId Organization ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspaceForIntegration (organizationId, integrationId) {
    const parameters = { orgId: organizationId, integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects_workspaces_credentials__credentialId_(
          this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_WORKSPACE_BY_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get the Project of a Workspace
   *
   * @param {string} organizationId Organization ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getProjectForWorkspace (organizationId, workspaceId) {
    const parameters = { orgId: organizationId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects_workspaces_workspaces__workspaceId_(
          this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_BY_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
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
  async deleteIntegration (organizationId, projectId, workspaceId, integrationType, integrationId) {
    const parameters = { orgId: organizationId, projectId, workspaceId, integrationType, integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__credentialId(
          this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all Organizations
   *
   * @returns {Promise<Response>} the response
   */
  async getOrganizations () {
    const sdkDetails = {}
    const parameters = {}

    try {
      const res = await this.sdk.apis.projects.get_console_organizations(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_ORGANIZATIONS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all Services available to an Organization
   *
   * @param {string} organizationId Organization ID
   * @returns {Promise<Response>} the response
   */
  async getServicesForOrg (organizationId) {
    const sdkDetails = { organizationId }
    const parameters = { orgId: organizationId }

    try {
      const res = await this.sdk.apis.projects.get_console_organizations__orgId__services(this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_SERVICES_FOR_ORG({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /** @private */
  __createRequestOptions (params, body) {
    return createRequestOptions({
      params,
      apiKey: this.apiKey,
      body
    })
  }
}

module.exports = {
  init: init
}
