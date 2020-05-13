/**
 * @property name - Name
 * @property title - Title
 * @property [who_created] - Creator name
 * @property description - Description
 * @property type - Type (default or jaeger)
 */
declare type ProjectDetails = {
    name: string;
    title: string;
    who_created?: string;
    description: string;
    type: string;
};

/**
 * @property name - Name
 * @property [title] - Title
 * @property [who_created] - Creator name
 * @property description - Description
 * @property [type] - Type
 * @property [quotaRule] - quotaRule
 */
declare type WorkspaceDetails = {
    name: string;
    title?: string;
    who_created?: string;
    description: string;
    type?: string;
    quotaRule?: string;
};

/**
 * @property name - Name
 * @property description - Description
 * @property [platform] - Platform
 * @property [urlScheme] - url scheme
 * @property [redirectUriList] - List of redirect URIs
 * @property [defaultRedirectUri] - Default redirect URI
 * @property [domain] - domain
 * @property [approvalInfo] - approvalInfo
 */
declare type IntegrationDetails = {
    name: string;
    description: string;
    platform?: string;
    urlScheme?: string;
    redirectUriList?: any;
    defaultRedirectUri?: string;
    domain?: string;
    approvalInfo?: any;
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
     * @param organizationId - Organization ID
     * @returns the response
     */
    getProjectsForOrg(organizationId: string): Promise<Response>;
    /**
     * Create a new Firefly Project (from template) in an Organization
     * @param organizationId - Organization ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    createFireflyProject(organizationId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Create a new Project in an Organization
     * @param organizationId - Organization ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    createProject(organizationId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Get all Workspaces for a Project
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @returns the response
     */
    getWorkspacesForProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Delete a Project
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @returns the response
     */
    deleteProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Edit a Project
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param projectDetails - Project details including name, title, who_created, description and type
     * @returns the response
     */
    editProject(organizationId: string, projectId: string, projectDetails: ProjectDetails): Promise<Response>;
    /**
     * Get a Project by ID
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @returns the response
     */
    getProject(organizationId: string, projectId: string): Promise<Response>;
    /**
     * Download the Workspace Configuration File (json)
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    downloadWorkspaceJson(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Create a new Workspace
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceDetails - Workspace details including name, title, who_created, description, type and quotaRule
     * @returns the response
     */
    createWorkspace(organizationId: string, projectId: string, workspaceDetails: WorkspaceDetails): Promise<Response>;
    /**
     * Edit a Workspace
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param workspaceDetails - Workspace details including name, title, who_created, description, type and quotaRule
     * @returns the response
     */
    editWorkspace(organizationId: string, projectId: string, workspaceId: string, workspaceDetails: WorkspaceDetails): Promise<Response>;
    /**
     * Get a Workspace by ID
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getWorkspace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Delete a Workspace
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    deleteWorkspace(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Get all Integrations for a Workspace
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getIntegrations(organizationId: string, projectId: string, workspaceId: string): Promise<Response>;
    /**
     * Create a new Enterprise Integration
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param certificate - Certificate
     * @param name - Integration name
     * @param description - Integration description
     * @returns the response
     */
    createEnterpriseIntegration(organizationId: string, projectId: string, workspaceId: string, certificate: Buffer, name: string, description: string): Promise<Response>;
    /**
     * Create a new AdobeID Integration
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param integrationDetails - Integration details
     * @returns the response
     */
    createAdobeIdIntegration(organizationId: string, projectId: string, workspaceId: string, integrationDetails: IntegrationDetails): Promise<Response>;
    /**
     * Subscribe an Integration to Services
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param integrationType - Integration type (adobeid, analytics or entp)
     * @param integrationId - Integration ID
     * @param serviceInfo - Information about the services like SDK Codes, licenseConfig and roles
     * @returns the response
     */
    subscribeIntegrationToServices(organizationId: string, projectId: string, workspaceId: string, integrationType: string, integrationId: string, serviceInfo: any): Promise<Response>;
    /**
     * Get the Workspace for an Integration
     * @param organizationId - Organization ID
     * @param integrationId - Integration ID
     * @returns the response
     */
    getWorkspaceForIntegration(organizationId: string, integrationId: string): Promise<Response>;
    /**
     * Get the Project of a Workspace
     * @param organizationId - Organization ID
     * @param workspaceId - Workspace ID
     * @returns the response
     */
    getProjectForWorkspace(organizationId: string, workspaceId: string): Promise<Response>;
    /**
     * Delete an Integration
     * @param organizationId - Organization ID
     * @param projectId - Project ID
     * @param workspaceId - Workspace ID
     * @param integrationType - Integration type (adobeid, analytics or entp)
     * @param integrationId - Integration ID
     * @returns the response
     */
    deleteIntegration(organizationId: string, projectId: string, workspaceId: string, integrationType: string, integrationId: string): Promise<Response>;
    /**
     * Get all Organizations
     * @returns the response
     */
    getOrganizations(): Promise<Response>;
}

