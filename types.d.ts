/**
 * Create request options compatible with the console swagger definition
 * @param apiKey - apiKey to access console api
 * @param options - optional data used for building the request options
 * @param [options.parameters] - parameters to set to the request, specific to each endpoint
 * @param [options.body] - request body for the request
 * @returns [{ swaggerParameters }, { requestBody }]
 */
declare function createRequestOptions(apiKey: string, options: {
    parameters?: any;
    body?: any;
}): any[];

/**
 * Build a swagger request interceptor for the console sdk
 * @param coreConsoleAPIInstance - console core api instance
 * @param apihost - console api url host
 * @returns a request interceptor
 */
declare function requestInterceptorBuilder(coreConsoleAPIInstance: any, apihost: string): (...params: any[]) => any;

/**
 * A swagger response interceptor for the console sdk
 * @param res - the response object
 * @returns the response object
 */
declare function responseInterceptor(res: any): any;

/**
 * @property url - requested url
 * @property ok - response ok indicator
 * @property status - response status code
 * @property statusText - response status text
 * @property headers - response headers
 * @property body - response body object
 * @property obj - response body object
 * @property data - response body string
 * @property text - response body string
 */
declare type Response = {
    url: string;
    ok: boolean;
    status: number;
    statusText: number;
    headers: any;
    body: any;
    obj: any;
    data: any;
    text: any;
};

/**
 * @property name - Name
 * @property title - Title
 * @property [who_created] - Creator name
 * @property [description] - Description
 * @property type - Type (default or jaeger)
 */
declare type ProjectDetails = {
    name: string;
    title: string;
    who_created?: string;
    description?: string;
    type: string;
};

/**
 * @property name - Name
 * @property [title] - Title
 * @property [who_created] - Creator name
 * @property [description] - Description
 * @property [type] - Type
 * @property [quotaRule] - quotaRule
 */
declare type WorkspaceDetails = {
    name: string;
    title?: string;
    who_created?: string;
    description?: string;
    type?: string;
    quotaRule?: string;
};

/**
 * @property name - Name
 * @property description - Description
 * @property platform - Platform
 * @property [urlScheme] - url scheme
 * @property [redirectUriList] - List of redirect URIs
 * @property [defaultRedirectUri] - Default redirect URI
 * @property [domain] - domain
 * @property [approvalInfo] - approvalInfo
 */
declare type AdobeIdIntegrationDetails = {
    name: string;
    description: string;
    platform: string;
    urlScheme?: string;
    redirectUriList?: any;
    defaultRedirectUri?: string;
    domain?: string;
    approvalInfo?: any;
};

/**
 * @property id - Id
 */
declare type ExtensionIcon = {
    id: string;
};

/**
 * @property id - Id
 * @property type - Type
 * @property order - order
 */
declare type ExtensionMedia = {
    id: string;
    type: string;
    order: string;
};

/**
 * @property name - Name
 * @property title - Title
 * @property description - Description
 * @property version - Version
 * @property icon - Icon
 * @property media - array of Media Objects
 */
declare type ExtensionDetails = {
    name: string;
    title: string;
    description: string;
    version: string;
    icon: ExtensionIcon;
    media: ExtensionMedia[];
};

/**
 * @property appType - app type
 * @property id - Id
 * @property notes - Notes
 */
declare type ExtensionSubmissionDetails = {
    appType: string;
    id: string;
    notes: string;
};

/**
 * @property additionalProp1 - additional property 1
 * @property additionalProp2 - additional property 2
 */
declare type ExtensionWrokspaceEndpoints = {
    additionalProp1: any;
    additionalProp2: any;
};

/**
 * @property code - Code
 * @property name - Name
 * @property licenseGroupIds - License group Ids
 */
declare type ExtensionWorkspaceServices = {
    code: string;
    name: string;
    licenseGroupIds: string[];
};

/**
 * @property id - Id
 * @property name - Name
 * @property endpoints - Description
 * @property services - Services
 * @property icon - Icon
 * @property releaseNotes - Release Notes
 * @property technicalUserId - Technical user Id
 * @property appId - App Id
 * @property publisherId - Publisher Id
 */
declare type ExtensionWorkspaceDetails = {
    id: string;
    name: string;
    endpoints: ExtensionWrokspaceEndpoints;
    services: ExtensionWorkspaceServices;
    icon: ExtensionIcon;
    releaseNotes: string;
    technicalUserId: string;
    appId: string;
    publisherId: string;
};

/**
 * Returns a Promise that resolves with a new CoreConsoleAPI object
 * @param accessToken - the access token corresponding to an integration or user token
 * @param apiKey - api key to access the Developer Console
 * @param [env = prod] - the server environment ('prod' or 'stage')
 * @returns a Promise with a CoreConsoleAPI object
 */
declare function init(accessToken: string, apiKey: string, env?: string): Promise<CoreConsoleAPI>;

/**
 * This class provides methods to call your CoreConsoleAPI APIs.
 * Before calling any method, initialize the instance by calling the `init` method on it
 * with valid values for apiKey and accessToken
 */
declare class CoreConsoleAPI {
    /**
     * Initializes a CoreConsoleAPI object and returns it
     * @param accessToken - the access token corresponding to an integration or user token
     * @param apiKey - api key to access the Developer Console
     * @param [env = prod] - the server environment ('prod' or 'stage')
     * @returns a CoreConsoleAPI object
     */
    init(accessToken: string, apiKey: string, env?: string): Promise<CoreConsoleAPI>;
    /**
     * Get all Projects in an Organization
     * @param organizationId - Organization AMS ID
     * @returns the response
     */
    getProjectsForOrg(organizationId: string): Promise<Response>;
    /**
     * Create a new Firefly Project (from template) in an Organization
     * @param organizationId - Organization AMS ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    createFireflyProject(organizationId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Create a new Project in an Organization
     * @param organizationId - Organization AMS ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    createProject(organizationId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Get all Workspaces for a Project
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @returns the response
     */
    getWorkspacesForProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Delete a Project
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @returns the response
     */
    deleteProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Edit a Project
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    editProject(organizationId: string, projectId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Get a Project by ID
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @returns the response
     */
    getProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Download the Workspace Configuration File (json)
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    downloadWorkspaceJson(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Create a new Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceDetails - Workspace details including name, title, who_created, description, type and quotaRule
     * @returns the response
     */
    createWorkspace(organizationId: string, projectId: string, workspaceDetails: WorkspaceDetails): Promise<Response>;
    /**
     * Edit a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param workspaceDetails - Workspace details including name, title, who_created, description, type and quotaRule
     * @returns the response
     */
    editWorkspace(organizationId: string, projectId: string, workspaceId: string, workspaceDetails: WorkspaceDetails): Promise<Response>;
    /**
     * Get a Workspace by ID
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getWorkspace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Delete a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    deleteWorkspace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Get all credentials for a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getCredentials(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Create a new Enterprise Credential for a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param certificate - A Readable stream with certificate content. eg: fs.createReadStream()
     * @param name - Credential name
     * @param description - Credential description
     * @returns the response
     */
    createEnterpriseCredential(organizationId: string, projectId: string, workspaceId: string, certificate: any, name: string, description: string): Promise<Response>;
    /**
     * Create a new AdobeID Credential for a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param credentialDetails - Credential details
     * @returns the response
     */
    createAdobeIdCredential(organizationId: string, projectId: string, workspaceId: string, credentialDetails: AdobeIdIntegrationDetails): Promise<Response>;
    /**
     * Create a new Analytics Credential for a Workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param credentialDetails - Credential details
     * @returns the response
     */
    createAnalyticsCredential(organizationId: string, projectId: string, workspaceId: string, credentialDetails: AdobeIdIntegrationDetails): Promise<Response>;
    /**
     * Subscribe a Workspace Credential to Services
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param credentialType - Credential type (adobeid, analytics or entp)
     * @param credentialId - Credential ID
     * @param serviceInfo - Information about the services like SDK Codes, licenseConfig and roles
     * @returns the response
     */
    subscribeCredentialToServices(organizationId: string, projectId: string, workspaceId: string, credentialType: string, credentialId: string, serviceInfo: any): Promise<Response>;
    /**
     * Get the Workspace from a Credential ID
     * @param organizationId - Organization AMS ID
     * @param credentialId - Credential ID
     * @returns the response
     */
    getWorkspaceForCredential(organizationId: string, credentialId: string): Promise<Response>;
    /**
     * Get the Project of a Workspace
     * @param organizationId - Organization AMS ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getProjectForWorkspace(organizationId: string, workspaceId: string): Promise<Response>;
    /**
     * Delete a Workspace Credential
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param credentialType - Credential type (adobeid, analytics or entp)
     * @param credentialId - Credential ID
     * @returns the response
     */
    deleteCredential(organizationId: string, projectId: string, workspaceId: string, credentialType: string, credentialId: string): Promise<Response>;
    /**
     * Get all Organizations
     * @returns the response
     */
    getOrganizations(): Promise<Response>;
    /**
     * Get all Services available to an Organization
     * @param organizationId - Organization AMS ID
     * @returns the response
     */
    getServicesForOrg(organizationId: string): Promise<Response>;
    /**
     * Create an Adobe I/O Runtime namespace in the given workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    createRuntimeNamespace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Get plugins for workspace
     * @param organizationId - Organization AMS ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getPluginsForWorkspace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Get Integrations for an Organization
     * @param organizationId - Organization AMS ID
     * @returns the response
     */
    getIntegrationsForOrg(organizationId: string): Promise<Response>;
    /**
     * Create a new Enterprise Integration for an Organization
     * @param organizationId - Organization AMS ID
     * @param certificate - A Readable stream with certificate content. eg: fs.createReadStream()
     * @param name - Integration name
     * @param description - Integration description
     * @returns the response
     */
    createEnterpriseIntegration(organizationId: string, certificate: any, name: string, description: string): Promise<Response>;
    /**
     * Create a new AdobeID Integration for an Organization
     * @param organizationId - Organization AMS ID
     * @param integrationDetails - Integration details
     * @returns the response
     */
    createAdobeIdIntegration(organizationId: string, integrationDetails: AdobeIdIntegrationDetails): Promise<Response>;
    /**
     * Update an AdobeID Integration for an Organization
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID to update
     * @param integrationDetails - Integration details
     * @returns the response
     */
    updateAdobeIdIntegration(organizationId: string, integrationId: string, integrationDetails: AdobeIdIntegrationDetails): Promise<Response>;
    /**
     * Subscribe Organization AdobeId Integration to Services
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @param serviceInfo - Information about the services like SDK Codes, licenseConfig and roles
     * @returns the response
     */
    subscribeAdobeIdIntegrationToServices(organizationId: string, integrationId: string, serviceInfo: any): Promise<Response>;
    /**
     * Subscribe Organization Enterprise Integration to Services
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @param serviceInfo - Information about the services like SDK Codes, licenseConfig and roles
     * @returns the response
     */
    subscribeEnterpriseIntegrationToServices(organizationId: string, integrationId: string, serviceInfo: any): Promise<Response>;
    /**
     * List certification bindings for an Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getBindingsForIntegration(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Upload and bind a certificate to an Organization Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @param certificate - A Readable stream with certificate content. eg: fs.createReadStream()
     * @returns the response
     */
    uploadAndBindCertificate(organizationId: string, integrationId: string, certificate: any): Promise<Response>;
    /**
     * Delete a certificate binding for an Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @param bindingId - Binding ID
     * @returns the response
     */
    deleteBinding(organizationId: string, integrationId: string, bindingId: string): Promise<Response>;
    /**
     * Get Integration details
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getIntegration(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Get Integration secrets
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getIntegrationSecrets(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Delete an Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    deleteIntegration(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Create an IMS Org
     * @returns the response
     */
    createIMSOrg(): Promise<Response>;
    /**
     * Get Application Atlas Policy for an Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getAtlasApplicationPolicy(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Get Atlas quota usage for an Integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getAtlasQuotaUsage(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Get list of extensions for an org
     * @param organizationId - Organization AMS ID
     * @param [options] - Query options
     * @param [options.appId] - App ID
     * @param [options.xp] - xp
     * @returns the response
     */
    getExtensionsForOrg(organizationId: string, options?: {
        appId?: string;
        xp?: string;
    }): Promise<Response>;
    /**
     * Create new Extension
     * @param organizationId - Organization AMS ID
     * @param extensionDetails - Extension details
     * @returns the response
     */
    createExtension(organizationId: string, extensionDetails: ExtensionDetails): Promise<Response>;
    /**
     * Submit an Extension
     * @param organizationId - Organization AMS ID
     * @param submisssionDetails - Extension submission details
     * @returns the response
     */
    submitExtension(organizationId: string, submisssionDetails: ExtensionSubmissionDetails[]): Promise<Response>;
    /**
     * Update an Extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @param extensionDetails - Extension details
     * @returns the response
     */
    updateExtension(organizationId: string, appId: string, extensionDetails: ExtensionDetails): Promise<Response>;
    /**
     * Delete an Extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @returns the response
     */
    deleteExtension(organizationId: string, appId: string): Promise<Response>;
    /**
     * Create a new workspace in an extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @param workspaceDetails - Workspace details
     * @returns the response
     */
    createExtensionWorkspace(organizationId: string, appId: string, workspaceDetails: ExtensionWorkspaceDetails): Promise<Response>;
    /**
     * Update a workspace in an extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @param workspaceName - Workspace Name
     * @param workspaceDetails - Workspace details
     * @returns the response
     */
    updateExtensionWorkspace(organizationId: string, appId: string, workspaceName: string, workspaceDetails: WorkspaceDetails): Promise<Response>;
    /**
     * Delete a workspace in an extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @param workspaceName - Workspace Name
     * @returns the response
     */
    deleteExtensionWorkspace(organizationId: string, appId: string, workspaceName: string): Promise<Response>;
    /**
     * Get details of a workspace in an extension
     * @param organizationId - Organization AMS ID
     * @param appId - App ID
     * @param workspaceName - Workspace Name
     * @returns the response
     */
    getExtensionWorkspace(organizationId: string, appId: string, workspaceName: string): Promise<Response>;
    /**
     * Check Extension Name
     * @param organizationId - Organization AMS ID
     * @param appName - App Name
     * @returns the response
     */
    checkExtensionName(organizationId: string, appName: string): Promise<Response>;
    /**
     * Get all available extension points
     * @param organizationId - Organization AMS ID
     * @param [xpId = All] - xp ID, default 'ALL'
     * @param [options] - Get options
     * @param [options.offset] - Offset
     * @param [options.pageSize] - page size
     * @returns the response
     */
    getAllExtensionPoints(organizationId: string, xpId?: string, options?: {
        offset?: number;
        pageSize?: number;
    }): Promise<Response>;
    /**
     * Get details about a service (SDK) subscribed to an integration
     * @param organizationId - Organization AMS ID
     * @param integrationId - Integration ID
     * @param sdkCode - the service sdkCode to query (e.g. AdobeAnalyticsSDK)
     * @returns the response
     */
    getSDKProperties(organizationId: string, integrationId: string, sdkCode: string): Promise<ConsoleResponse>;
}

