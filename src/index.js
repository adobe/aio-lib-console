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
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { provider: 'debug', level: process.env.LOG_LEVEL || 'debug' })
const { reduceError, requestInterceptorBuilder, responseInterceptor, createRequestOptions } = require('./helpers')
const { codes } = require('./SDKErrors')
const { DEFAULT_ENV, getCliEnv } = require('@adobe/aio-lib-env')

/**
 * @typedef {object} Response
 * @property {string} url requested url
 * @property {boolean} ok response ok indicator
 * @property {number} status response status code
 * @property {number} statusText response status text
 * @property {object} headers response headers
 * @property {object} body response body object
 * @property {object} obj response body object
 * @property {object} data response body string
 * @property {object} text response body string
 */

/**
 * @typedef {object} ProjectDetails
 * @property {string} name Name
 * @property {string} title Title
 * @property {string} [who_created] Creator name
 * @property {string} [description] Description
 * @property {string} type Type (default or jaeger)
 */

/**
 * @typedef {object} WorkspaceDetails
 * @property {string} name Name
 * @property {string} [title] Title
 * @property {string} [who_created] Creator name
 * @property {string} [description] Description
 * @property {string} [type] Type
 * @property {string} [quotaRule] quotaRule
 */

/**
 * @typedef {object} AdobeIdIntegrationDetails
 * @property {string} name Name
 * @property {string} description Description
 * @property {string} platform Platform
 * @property {string} [urlScheme] url scheme
 * @property {object} [redirectUriList] List of redirect URIs
 * @property {string} [defaultRedirectUri] Default redirect URI
 * @property {string} [domain] domain
 * @property {object} [approvalInfo] approvalInfo
 */

/**
 * @typedef {object} ExtensionIcon
 * @property {string} id Id
 */

/**
 * @typedef {object} ExtensionMedia
 * @property {string} id Id
 * @property {string} type Type
 * @property {string} order order
 */

/**
 * @typedef {object} ExtensionDetails
 * @property {string} name Name
 * @property {string} title Title
 * @property {string} description Description
 * @property {string} version Version
 * @property {ExtensionIcon} icon Icon
 * @property {Array.<ExtensionMedia>} media array of Media Objects
 */

/**
 * @typedef {object} ExtensionSubmissionDetails
 * @property {string} appType app type
 * @property {string} id Id
 * @property {string} notes Notes
 */

/**
 * @typedef {object} ExtensionWorkspaceEndpoints
 * @property {object} additionalProp1 additional property 1
 * @property {object} additionalProp2 additional property 2
 */

/**
 * @typedef {object} ExtensionWorkspaceServices
 * @property {string} code Code
 * @property {string} name Name
 * @property {Array.<string>} licenseGroupIds License group Ids
 */

/**
 * @typedef {object} ExtensionWorkspaceDetails
 * @property {string} id Id
 * @property {string} name Name
 * @property {ExtensionWorkspaceEndpoints} endpoints Description
 * @property {ExtensionWorkspaceServices} services Services
 * @property {ExtensionIcon} icon Icon
 * @property {string} releaseNotes Release Notes
 * @property {string} technicalUserId Technical user Id
 * @property {string} appId App Id
 * @property {string} publisherId Publisher Id
 */

/**
 * @typedef {object} ServiceInfo
 * @property {string} sdkCode the sdk code
 * @property {Array<Role>} roles the roles
 * @property {Array<LicenseConfig>} licenseConfigs the license configs
 */

/**
 * @typedef {object} LicenseConfig
 * @property {string} op the operation (e.g. 'add')
 * @property {string} id the license id
 * @property {string} productId the product id
 */

/**
 * @typedef {object} Role
 * @property {number} id the role id
 * @property {string} code the role code
 * @property {string} name the role name
 */

const API_HOST = {
  prod: 'developers.adobe.io',
  stage: 'developers-stage.adobe.io'
}

/**
 * Returns a Promise that resolves with a new CoreConsoleAPI object
 *
 * @param {string} accessToken the access token corresponding to an integration or user token
 * @param {string} apiKey api key to access the Developer Console
 * @param {string} env The name of the environment. `prod` and `stage`
 *      are the only values supported. `prod` is default and any value
 *      other than `prod` or `stage` it is assumed to be the default
 *      value of `prod`. If not set, it will get the global cli env value. See https://github.com/adobe/aio-lib-env
 *      (which defaults to `prod` as well if not set)
 * @returns {Promise<CoreConsoleAPI>} a Promise with a CoreConsoleAPI object
 */
function init (accessToken, apiKey, env = getCliEnv()) {
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
   * @param {string} env The name of the environment. `prod` and `stage`
   *      are the only values supported. `prod` is default and any value
   *      other than `prod` or `stage` it is assumed to be the default
   *      value of `prod`. If not set, it will get the global cli env value. See https://github.com/adobe/aio-lib-env
   *      (which defaults to `prod` as well if not set)
   * @returns {Promise<CoreConsoleAPI>} a CoreConsoleAPI object
   */
  async init (accessToken, apiKey, env) {
    const initErrors = []
    if (!accessToken) {
      initErrors.push('accessToken')
    }

    let apiHost = API_HOST[env]
    if (!apiHost) {
      apiHost = API_HOST[DEFAULT_ENV]
      env = DEFAULT_ENV
    }

    if (initErrors.length) {
      const sdkDetails = { accessToken }
      throw new codes.ERROR_SDK_INITIALIZATION({ sdkDetails, messageValues: `${initErrors.join(', ')}` })
    } else {
      // init swagger client
      const spec = require('../spec/api.json')
      const swagger = new Swagger({
        spec: spec,
        requestInterceptor: requestInterceptorBuilder(this, apiHost),
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
   * @param {string} organizationId Organization AMS ID
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
   * Create a new App Builder Project (from template) in an Organization
   *
   * @param {string} organizationId Organization AMS ID
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
   * @param {string} organizationId Organization AMS ID
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
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspacesForProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId: projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId__workspaces(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_WORKSPACES_BY_PROJECT_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a Project
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async deleteProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .delete_console_organizations__orgId__projects__projectId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_PROJECT({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Edit a Project
   *
   * @param {string} organizationId Organization AMS ID
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
        .patch_console_organizations__orgId__projects__projectId_(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_EDIT_PROJECT({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get a Project by ID
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @returns {Promise<Response>} the response
   */
  async getProject (organizationId, projectId) {
    const parameters = { orgId: organizationId, projectId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.projects
        .get_console_organizations__orgId__projects__projectId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_BY_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Download the Workspace Configuration File (json)
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async downloadWorkspaceJson (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__download(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DOWNLOAD_WORKSPACE_JSON({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {WorkspaceDetails} workspaceDetails Workspace details including name, title, who_created, description, type and quotaRule
   * @returns {Promise<Response>} the response
   */
  async createWorkspace (organizationId, projectId, workspaceDetails) {
    const parameters = { orgId: organizationId, projectId }
    const requestBody = workspaceDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.workspaces
        .post_console_organizations__orgId__projects__projectId__workspaces(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Edit a Workspace
   *
   * @param {string} organizationId Organization AMS ID
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
      const res = await this.sdk.apis.workspaces
        .patch_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_EDIT_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get a Workspace by ID
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_WORKSPACE_BY_ID({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async deleteWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all credentials for a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getCredentials (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_CREDENTIALS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Enterprise Credential for a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {object} certificate A Readable stream with certificate content. eg: fs.createReadStream()
   * @param {string} name Credential name
   * @param {string} description Credential description
   * @returns {Promise<Response>} the response
   */
  async createEnterpriseCredential (organizationId, projectId, workspaceId, certificate, name, description) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = { certificate, name, description }
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.workspaces
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_entp(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ENTERPRISE_CREDENTIAL({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new AdobeID Credential for a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {AdobeIdIntegrationDetails} credentialDetails Credential details
   * @returns {Promise<Response>} the response
   */
  async createAdobeIdCredential (organizationId, projectId, workspaceId, credentialDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = credentialDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.workspaces
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_adobeId(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ADOBEID_CREDENTIAL({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Analytics Credential for a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {AdobeIdIntegrationDetails} credentialDetails Credential details
   * @returns {Promise<Response>} the response
   */
  async createAnalyticsCredential (organizationId, projectId, workspaceId, credentialDetails) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const requestBody = credentialDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.workspaces
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials_analytics(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ANALYTICS_CREDENTIAL({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Subscribe a Workspace Credential to Services
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {string} credentialType Credential type (adobeid, analytics or entp)
   * @param {string} credentialId Credential ID
   * @param {Array<ServiceInfo>} serviceInfo Information about the services like SDK Codes, licenseConfig and roles
   * @returns {Promise<Response>} the response
   */
  async subscribeCredentialToServices (organizationId, projectId, workspaceId, credentialType, credentialId, serviceInfo) {
    const parameters = {
      orgId: organizationId,
      projectId,
      workspaceId,
      credentialId,
      credentialType: credentialType
    }
    const requestBody = serviceInfo
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.workspaces
        .put_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__credentialType___credentialId__services(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_SUBSCRIBE_CREDENTIAL_TO_SERVICES({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get the Workspace from a Credential ID
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} credentialId Credential ID
   * @returns {Promise<Response>} the response
   */
  async getWorkspaceForCredential (organizationId, credentialId) {
    const parameters = { orgId: organizationId, credentialId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .get_console_organizations__orgId__projects_workspaces_credentials__credentialId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_WORKSPACE_BY_CREDENTIAL({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get the Project of a Workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getProjectForWorkspace (organizationId, workspaceId) {
    const parameters = { orgId: organizationId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .get_console_organizations__orgId__projects_workspaces_workspaces__workspaceId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PROJECT_BY_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a Workspace Credential
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {string} credentialType Credential type (adobeid, analytics or entp)
   * @param {string} credentialId Credential ID
   * @returns {Promise<Response>} the response
   */
  async deleteCredential (organizationId, projectId, workspaceId, credentialType, credentialId) {
    const parameters = { orgId: organizationId, projectId, workspaceId, credentialType, credentialId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces
        .delete_console_organizations__orgId__projects__projectId__workspaces__workspaceId__credentials__credentialId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_CREDENTIAL({ sdkDetails, messageValues: reduceError(err) })
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
      const res = await this.sdk.apis.Organizations
        .get_console_organizations(...this.__createRequestOptions(parameters))
      return res
    } catch (err) {
      throw new codes.ERROR_GET_ORGANIZATIONS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get all Services available to an Organization
   *
   * @param {string} organizationId Organization AMS ID
   * @returns {Promise<Response>} the response
   */
  async getServicesForOrg (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .get_console_organizations__orgId__services(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_SERVICES_FOR_ORG({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Check developer terms acceptance
   *
   * @param {string} organizationId Organization AMS ID
   * @returns {Promise<Response>} the response
   */
  async checkOrgDevTerms (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }
    try {
      const res = await this.sdk.apis.DevTerms
        .get_console_services_ims_organizations__orgId__terms(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_DEV_TERMS_ACCEPTANCE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Accept developer terms
   *
   * @param {string} organizationId Organization AMS ID
   * @returns {Promise<Response>} the response
   */
  async acceptOrgDevTerms (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.DevTerms
        .post_console_services_ims_organizations__orgId__terms(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_POST_DEV_TERMS_ACCEPTANCE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get developer terms
   *
   * @returns {Promise<Response>} the response
   */
  async getDevTerms () {
    const sdkDetails = {}
    const parameters = {}

    try {
      const res = await this.sdk.apis.DevTerms
        .get_console_services_ims_terms(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_DEV_TERMS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create an Adobe I/O Runtime namespace in the given workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async createRuntimeNamespace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.runtime
        .post_console_organizations__orgId__projects__projectId__workspaces__workspaceId__namespace(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_RUNTIME_NAMESPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get plugins for workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getPluginsForWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId, workspaceId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.workspaces.get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__plugins(
        ...this.__createRequestOptions(parameters)
      )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_PLUGINS_BY_WORKSPACE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Integrations for an Organization
   *
   * @param {string} organizationId Organization AMS ID
   * @returns {Promise<Response>} the response
   */
  async getIntegrationsForOrg (organizationId) {
    const parameters = { orgId: organizationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations.get_console_organizations__orgId__integrations(
        ...this.__createRequestOptions(parameters)
      )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_INTEGRATIONS_BY_ORG({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new Enterprise Integration for an Organization
   *
   * @param {string} organizationId Organization AMS ID
   * @param {object} certificate A Readable stream with certificate content. eg: fs.createReadStream()
   * @param {string} name Integration name
   * @param {string} description Integration description
   * @returns {Promise<Response>} the response
   */
  async createEnterpriseIntegration (organizationId, certificate, name, description) {
    const parameters = { orgId: organizationId, name, description }
    const requestBody = { certificate }
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .post_console_organizations__orgId__integrations_entp(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ENTERPRISE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create a new AdobeID Integration for an Organization
   *
   * @param {string} organizationId Organization AMS ID
   * @param {AdobeIdIntegrationDetails} integrationDetails Integration details
   * @returns {Promise<Response>} the response
   */
  async createAdobeIdIntegration (organizationId, integrationDetails) {
    const parameters = { orgId: organizationId }
    const requestBody = integrationDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .post_console_organizations__orgId__integrations_adobeId(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_ADOBEID_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Update an AdobeID Integration for an Organization
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID to update
   * @param {AdobeIdIntegrationDetails} integrationDetails Integration details
   * @returns {Promise<Response>} the response
   */
  async updateAdobeIdIntegration (organizationId, integrationId, integrationDetails) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const requestBody = integrationDetails
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .put_console_organizations__orgId__integrations_adobeId(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_UPDATE_ADOBEID_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Subscribe Organization AdobeId Integration to Services
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @param {object} serviceInfo Information about the services like SDK Codes, licenseConfig and roles
   * @returns {Promise<Response>} the response
   */
  async subscribeAdobeIdIntegrationToServices (organizationId, integrationId, serviceInfo) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const requestBody = serviceInfo
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .put_console_organizations__orgId__integrations_adobeid__intId__services(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_SUBSCRIBE_ADOBEID_INTEGRATION_TO_SERVICES({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Subscribe Organization Enterprise Integration to Services
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @param {object} serviceInfo Information about the services like SDK Codes, licenseConfig and roles
   * @returns {Promise<Response>} the response
   */
  async subscribeEnterpriseIntegrationToServices (organizationId, integrationId, serviceInfo) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const requestBody = serviceInfo
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .put_console_organizations__orgId__integrations_entp__intId__services(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_SUBSCRIBE_ENTERPRISE_INTEGRATION_TO_SERVICES({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * List certification bindings for an Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getBindingsForIntegration (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .get_console_organizations__orgId__integrations_entp__intId__bindings(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_BINDINGS_FOR_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Upload and bind a certificate to an Organization Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @param {object} certificate A Readable stream with certificate content. eg: fs.createReadStream()
   * @returns {Promise<Response>} the response
   */
  async uploadAndBindCertificate (organizationId, integrationId, certificate) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const requestBody = { certificate }
    const sdkDetails = { parameters, requestBody }

    try {
      const res = await this.sdk.apis.Organizations
        .post_console_organizations__orgId__integrations_entp__intId__bindings(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_UPLOAD_AND_BIND_CERTIFICATE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete a certificate binding for an Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @param {string} bindingId Binding ID
   * @returns {Promise<Response>} the response
   */
  async deleteBinding (organizationId, integrationId, bindingId) {
    const parameters = { orgId: organizationId, intId: integrationId, bindingId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .delete_console_organizations__orgId__integrations_entp__intId__bindings__bindingId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_BINDING({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Integration details
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getIntegration (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .get_console_organizations__orgId__integrations__intId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Integration secrets
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getIntegrationSecrets (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .get_console_organizations__orgId__integrations__intId__secrets(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_INTEGRATION_SECRETS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Delete an Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async deleteIntegration (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .delete_console_organizations__orgId__integrations__intId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_DELETE_INTEGRATION({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Create an IMS Org
   *
   * @returns {Promise<Response>} the response
   */
  async createIMSOrg () {
    const parameters = { }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.Organizations
        .post_console_organizations(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_CREATE_IMS_ORG({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Application Atlas Policy for an Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getAtlasApplicationPolicy (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.AtlasPolicyEngine
        .get_console_organizations__orgId__policy__intId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_ATLAS_APPLICATION_POLICY({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Atlas quota usage for an Integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @returns {Promise<Response>} the response
   */
  async getAtlasQuotaUsage (organizationId, integrationId) {
    const parameters = { orgId: organizationId, intId: integrationId }
    const sdkDetails = { parameters }

    try {
      const res = await this.sdk.apis.AtlasPolicyEngine
        .get_console_organizations__orgId__policy__intId__usage(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_ATLAS_QUOTA_USAGE({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   *  Get all available extension points
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} [xpId] xp ID, default 'firefly'
   * @param {object} [options] Get options
   * @param {number} [options.offset] Offset
   * @param {number} [options.pageSize] page size
   * @returns {Promise<Response>} the response
   */
  async getAllExtensionPoints (organizationId, xpId = 'firefly', options = {}) {
    const parameters = options
    parameters.orgId = organizationId
    parameters.xpId = xpId
    const sdkDetails = { parameters }
    try {
      const res = await this.sdk.apis.Extensions
        .get_console_organizations__orgId__xp__xpId_(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_ALL_EXTENSIONPOINTS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   * Get Extensions for an App Builder application
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} applicationId App Builder Application ID
   * @returns {Promise<Response>} the response
   */
  async getApplicationExtensions (organizationId, applicationId) {
    const parameters = { orgId: organizationId, appId: applicationId }
    const sdkDetails = { parameters }
    try {
      const res = await this.sdk.apis.Extensions
        .get_console_organizations__orgId__xr_api_v1_app(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_APPLICATION_EXTENSIONS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   *  Get endpoints in a workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @returns {Promise<Response>} the response
   */
  async getEndPointsInWorkspace (organizationId, projectId, workspaceId) {
    const parameters = { orgId: organizationId, projectId: projectId, workspaceId: workspaceId }

    const sdkDetails = { parameters }
    try {
      const res = await this.sdk.apis.Extensions
        .get_console_organizations__orgId__projects__projectId__workspaces__workspaceId__endpoints(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_WORKSPACE_ENDPOINTS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /**
   *  Update endpoints in a workspace
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} projectId Project ID
   * @param {string} workspaceId Workspace ID
   * @param {object} endpointDetails endpoint details
   * @returns {Promise<Response>} the response
   */
  async updateEndPointsInWorkspace (organizationId, projectId, workspaceId, endpointDetails) {
    const parameters = { orgId: organizationId, projectId: projectId, workspaceId: workspaceId }
    const requestBody = endpointDetails
    const sdkDetails = { parameters, requestBody }
    try {
      const res = await this.sdk.apis.Extensions
        .put_console_organizations__orgId__projects__projectId__workspaces__workspaceId__endpoints(
          ...this.__createRequestOptions(parameters, requestBody)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_UPDATE_WORKSPACE_ENDPOINTS({ sdkDetails, messageValues: reduceError(err) })
    }
  }

  /** @private */
  __createRequestOptions (parameters, body) {
    return createRequestOptions(
      this.apiKey,
      {
        parameters,
        body
      }
    )
  }

  /**
   * Get details about a service (SDK) subscribed to an integration
   *
   * @param {string} organizationId Organization AMS ID
   * @param {string} integrationId Integration ID
   * @param {string} sdkCode the service sdkCode to query (e.g. AdobeAnalyticsSDK)
   * @returns {Promise<Response>} the response
   */
  async getSDKProperties (organizationId, integrationId, sdkCode) {
    const parameters = { orgId: organizationId, intId: integrationId, sdkCode }
    const sdkDetails = { parameters }
    try {
      const res = await this.sdk.apis.Organizations
        .get_console_organizations__orgId__integrations_entp__intId__service__sdkCode__properties(
          ...this.__createRequestOptions(parameters)
        )
      return res
    } catch (err) {
      throw new codes.ERROR_GET_SDK_PROPERTIES({ sdkDetails, messageValues: reduceError(err) })
    }
  }
}

module.exports = {
  init: init
}
