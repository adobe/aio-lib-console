<!--
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

[![Version](https://img.shields.io/npm/v/@adobe/aio-lib-console.svg)](https://npmjs.org/package/@adobe/aio-lib-console)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/aio-lib-console.svg)](https://npmjs.org/package/@adobe/aio-lib-console)
[![Build Status](https://travis-ci.com/adobe/aio-lib-console.svg?branch=master)](https://travis-ci.com/adobe/aio-lib-console)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/aio-lib-console/master.svg?style=flat-square)](https://codecov.io/gh/adobe/aio-lib-console/)

# Adobe I/O Console SDK Library

### Installing

```bash
$ npm install @adobe/aio-lib-console
```

### Usage
1) Initialize the SDK

```javascript
const sdk = require('@adobe/aio-lib-console')

async function sdkTest() {
  //initialize sdk
  const client = await sdk.init('<valid auth token>', 'x-api-key')
}
```

2) Call methods using the initialized SDK

```javascript
const sdk = require('@adobe/aio-lib-console')

async function sdkTest() {
  // initialize sdk
  const client = await sdk.init('<valid auth token>', 'x-api-key')

  // call methods
  try {
    // get... something
    const result = await client.getOrganizations()
    console.log(result)

  } catch (e) {
    console.error(e)
  }
}
```

## Classes

<dl>
<dt><a href="#CoreConsoleAPI">CoreConsoleAPI</a></dt>
<dd><p>This class provides methods to call your CoreConsoleAPI APIs.
Before calling any method, initialize the instance by calling the <code>init</code> method on it
with valid values for apiKey and accessToken</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createRequestOptions">createRequestOptions(apiKey, options)</a> ⇒ <code>Array</code></dt>
<dd><p>Create request options compatible with the console swagger definition</p>
</dd>
<dt><a href="#requestInterceptorBuilder">requestInterceptorBuilder(coreConsoleAPIInstance, apihost)</a> ⇒ <code>function</code></dt>
<dd><p>Build a swagger request interceptor for the console sdk</p>
</dd>
<dt><a href="#responseInterceptor">responseInterceptor(res)</a> ⇒ <code>object</code></dt>
<dd><p>A swagger response interceptor for the console sdk</p>
</dd>
<dt><a href="#init">init(accessToken, apiKey, [env])</a> ⇒ <code><a href="#CoreConsoleAPI">Promise.&lt;CoreConsoleAPI&gt;</a></code></dt>
<dd><p>Returns a Promise that resolves with a new CoreConsoleAPI object</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ProjectDetails">ProjectDetails</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#WorkspaceDetails">WorkspaceDetails</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AdobeIdIntegrationDetails">AdobeIdIntegrationDetails</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="CoreConsoleAPI"></a>

## CoreConsoleAPI
This class provides methods to call your CoreConsoleAPI APIs.
Before calling any method, initialize the instance by calling the `init` method on it
with valid values for apiKey and accessToken

**Kind**: global class  

* [CoreConsoleAPI](#CoreConsoleAPI)
    * [.init(accessToken, apiKey, [env])](#CoreConsoleAPI+init) ⇒ [<code>Promise.&lt;CoreConsoleAPI&gt;</code>](#CoreConsoleAPI)
    * [.getProjectsForOrg(organizationId)](#CoreConsoleAPI+getProjectsForOrg) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createFireflyProject(organizationId, projectDetails)](#CoreConsoleAPI+createFireflyProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createProject(organizationId, projectDetails)](#CoreConsoleAPI+createProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getWorkspacesForProject(organizationId, projectId)](#CoreConsoleAPI+getWorkspacesForProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteProject(organizationId, projectId)](#CoreConsoleAPI+deleteProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.editProject(organizationId, projectId, projectDetails)](#CoreConsoleAPI+editProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getProject(organizationId, projectId)](#CoreConsoleAPI+getProject) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.downloadWorkspaceJson(organizationId, projectId, workspaceId)](#CoreConsoleAPI+downloadWorkspaceJson) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createWorkspace(organizationId, projectId, workspaceDetails)](#CoreConsoleAPI+createWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.editWorkspace(organizationId, projectId, workspaceId, workspaceDetails)](#CoreConsoleAPI+editWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getWorkspace(organizationId, projectId, workspaceId)](#CoreConsoleAPI+getWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteWorkspace(organizationId, projectId, workspaceId)](#CoreConsoleAPI+deleteWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getCredentials(organizationId, projectId, workspaceId)](#CoreConsoleAPI+getCredentials) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createEnterpriseCredential(organizationId, projectId, workspaceId, certificate, name, description)](#CoreConsoleAPI+createEnterpriseCredential) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createAdobeIdCredential(organizationId, projectId, workspaceId, credentialDetails)](#CoreConsoleAPI+createAdobeIdCredential) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createAnalyticsCredential(organizationId, projectId, workspaceId, credentialDetails)](#CoreConsoleAPI+createAnalyticsCredential) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.subscribeCredentialToServices(organizationId, projectId, workspaceId, credentialType, credentialId, serviceInfo)](#CoreConsoleAPI+subscribeCredentialToServices) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getWorkspaceForCredential(organizationId, credentialId)](#CoreConsoleAPI+getWorkspaceForCredential) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getProjectForWorkspace(organizationId, workspaceId)](#CoreConsoleAPI+getProjectForWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteCredential(organizationId, projectId, workspaceId, credentialType, credentialId)](#CoreConsoleAPI+deleteCredential) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getOrganizations()](#CoreConsoleAPI+getOrganizations) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getServicesForOrg(organizationId)](#CoreConsoleAPI+getServicesForOrg) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createRuntimeNamespace(organizationId, projectId, workspaceId)](#CoreConsoleAPI+createRuntimeNamespace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getPluginsForWorkspace(organizationId, projectId, workspaceId)](#CoreConsoleAPI+getPluginsForWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getIntegrationsForOrg(organizationId)](#CoreConsoleAPI+getIntegrationsForOrg) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createEnterpriseIntegration(organizationId, certificate, name, description)](#CoreConsoleAPI+createEnterpriseIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createAdobeIdIntegration(organizationId, integrationDetails)](#CoreConsoleAPI+createAdobeIdIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updateAdobeIdIntegration(organizationId, integrationId, integrationDetails)](#CoreConsoleAPI+updateAdobeIdIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.subscribeAdobeIdIntegrationToServices(organizationId, integrationId, serviceInfo)](#CoreConsoleAPI+subscribeAdobeIdIntegrationToServices) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.subscribeEnterpriseIntegrationToServices(organizationId, integrationId, serviceInfo)](#CoreConsoleAPI+subscribeEnterpriseIntegrationToServices) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getBindingsForIntegration(organizationId, integrationId)](#CoreConsoleAPI+getBindingsForIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.uploadAndBindCertificate(organizationId, integrationId, certificate)](#CoreConsoleAPI+uploadAndBindCertificate) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteBinding(organizationId, integrationId, bindingId)](#CoreConsoleAPI+deleteBinding) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getIntegration(organizationId, integrationId)](#CoreConsoleAPI+getIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getIntegrationSecrets(organizationId, integrationId)](#CoreConsoleAPI+getIntegrationSecrets) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteIntegration(organizationId, integrationId)](#CoreConsoleAPI+deleteIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createIMSOrg()](#CoreConsoleAPI+createIMSOrg) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getAtlasApplicationPolicy(organizationId, integrationId)](#CoreConsoleAPI+getAtlasApplicationPolicy) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getAtlasQuotaUsage(organizationId, integrationId)](#CoreConsoleAPI+getAtlasQuotaUsage) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.validateApplicationName(organizationId, applicationName)](#CoreConsoleAPI+validateApplicationName) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getApplicationById(organizationId, applicationId)](#CoreConsoleAPI+getApplicationById) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updateApplication(organizationId, applicationId, applicationDetails)](#CoreConsoleAPI+updateApplication) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteApplication(organizationId, applicationId)](#CoreConsoleAPI+deleteApplication) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getApplicationByName(organizationId, applicationName)](#CoreConsoleAPI+getApplicationByName) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.submitApplication(organizationId, applicationId, submitterNotes)](#CoreConsoleAPI+submitApplication) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getAllApplicationsForUser(organizationId, offset, pageSize)](#CoreConsoleAPI+getAllApplicationsForUser) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.uploadApplicationIcon(organizationId, applicationId, icon)](#CoreConsoleAPI+uploadApplicationIcon) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getAppRegistryHealth(organizationId)](#CoreConsoleAPI+getAppRegistryHealth) ⇒ <code>Promise.&lt;Response&gt;</code>

<a name="CoreConsoleAPI+init"></a>

### coreConsoleAPI.init(accessToken, apiKey, [env]) ⇒ [<code>Promise.&lt;CoreConsoleAPI&gt;</code>](#CoreConsoleAPI)
Initializes a CoreConsoleAPI object and returns it

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: [<code>Promise.&lt;CoreConsoleAPI&gt;</code>](#CoreConsoleAPI) - a CoreConsoleAPI object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accessToken | <code>string</code> |  | the access token corresponding to an integration or user token |
| apiKey | <code>string</code> |  | api key to access the Developer Console |
| [env] | <code>string</code> | <code>&quot;prod&quot;</code> | the server environment ('prod' or 'stage') |

<a name="CoreConsoleAPI+getProjectsForOrg"></a>

### coreConsoleAPI.getProjectsForOrg(organizationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Projects in an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |

<a name="CoreConsoleAPI+createFireflyProject"></a>

### coreConsoleAPI.createFireflyProject(organizationId, projectDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Firefly Project (from template) in an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectDetails | [<code>ProjectDetails</code>](#ProjectDetails) | Project details including name, title, who_created, description and type |

<a name="CoreConsoleAPI+createProject"></a>

### coreConsoleAPI.createProject(organizationId, projectDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Project in an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectDetails | [<code>ProjectDetails</code>](#ProjectDetails) | Project details including name, title, who_created, description and type |

<a name="CoreConsoleAPI+getWorkspacesForProject"></a>

### coreConsoleAPI.getWorkspacesForProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Workspaces for a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+deleteProject"></a>

### coreConsoleAPI.deleteProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+editProject"></a>

### coreConsoleAPI.editProject(organizationId, projectId, projectDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Edit a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| projectDetails | [<code>ProjectDetails</code>](#ProjectDetails) | Project details including name, title, who_created, description and type |

<a name="CoreConsoleAPI+getProject"></a>

### coreConsoleAPI.getProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get a Project by ID

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+downloadWorkspaceJson"></a>

### coreConsoleAPI.downloadWorkspaceJson(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Download the Workspace Configuration File (json)

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+createWorkspace"></a>

### coreConsoleAPI.createWorkspace(organizationId, projectId, workspaceDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceDetails | [<code>WorkspaceDetails</code>](#WorkspaceDetails) | Workspace details including name, title, who_created, description, type and quotaRule |

<a name="CoreConsoleAPI+editWorkspace"></a>

### coreConsoleAPI.editWorkspace(organizationId, projectId, workspaceId, workspaceDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Edit a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| workspaceDetails | [<code>WorkspaceDetails</code>](#WorkspaceDetails) | Workspace details including name, title, who_created, description, type and quotaRule |

<a name="CoreConsoleAPI+getWorkspace"></a>

### coreConsoleAPI.getWorkspace(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get a Workspace by ID

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+deleteWorkspace"></a>

### coreConsoleAPI.deleteWorkspace(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+getCredentials"></a>

### coreConsoleAPI.getCredentials(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all credentials for a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+createEnterpriseCredential"></a>

### coreConsoleAPI.createEnterpriseCredential(organizationId, projectId, workspaceId, certificate, name, description) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Enterprise Credential for a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| certificate | <code>object</code> | A Readable stream with certificate content. eg: fs.createReadStream() |
| name | <code>string</code> | Credential name |
| description | <code>string</code> | Credential description |

<a name="CoreConsoleAPI+createAdobeIdCredential"></a>

### coreConsoleAPI.createAdobeIdCredential(organizationId, projectId, workspaceId, credentialDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new AdobeID Credential for a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| credentialDetails | [<code>AdobeIdIntegrationDetails</code>](#AdobeIdIntegrationDetails) | Credential details |

<a name="CoreConsoleAPI+createAnalyticsCredential"></a>

### coreConsoleAPI.createAnalyticsCredential(organizationId, projectId, workspaceId, credentialDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Analytics Credential for a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| credentialDetails | [<code>AdobeIdIntegrationDetails</code>](#AdobeIdIntegrationDetails) | Credential details |

<a name="CoreConsoleAPI+subscribeCredentialToServices"></a>

### coreConsoleAPI.subscribeCredentialToServices(organizationId, projectId, workspaceId, credentialType, credentialId, serviceInfo) ⇒ <code>Promise.&lt;Response&gt;</code>
Subscribe a Workspace Credential to Services

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| credentialType | <code>string</code> | Credential type (adobeid, analytics or entp) |
| credentialId | <code>string</code> | Credential ID |
| serviceInfo | <code>object</code> | Information about the services like SDK Codes, licenseConfig and roles |

<a name="CoreConsoleAPI+getWorkspaceForCredential"></a>

### coreConsoleAPI.getWorkspaceForCredential(organizationId, credentialId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get the Workspace from a Credential ID

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| credentialId | <code>string</code> | Credential ID |

<a name="CoreConsoleAPI+getProjectForWorkspace"></a>

### coreConsoleAPI.getProjectForWorkspace(organizationId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get the Project of a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+deleteCredential"></a>

### coreConsoleAPI.deleteCredential(organizationId, projectId, workspaceId, credentialType, credentialId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a Workspace Credential

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| credentialType | <code>string</code> | Credential type (adobeid, analytics or entp) |
| credentialId | <code>string</code> | Credential ID |

<a name="CoreConsoleAPI+getOrganizations"></a>

### coreConsoleAPI.getOrganizations() ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Organizations

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  
<a name="CoreConsoleAPI+getServicesForOrg"></a>

### coreConsoleAPI.getServicesForOrg(organizationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Services available to an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |

<a name="CoreConsoleAPI+createRuntimeNamespace"></a>

### coreConsoleAPI.createRuntimeNamespace(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Create an Adobe I/O Runtime namespace in the given workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+getPluginsForWorkspace"></a>

### coreConsoleAPI.getPluginsForWorkspace(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get plugins for workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+getIntegrationsForOrg"></a>

### coreConsoleAPI.getIntegrationsForOrg(organizationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get Integrations for an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |

<a name="CoreConsoleAPI+createEnterpriseIntegration"></a>

### coreConsoleAPI.createEnterpriseIntegration(organizationId, certificate, name, description) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Enterprise Integration for an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| certificate | <code>object</code> | A Readable stream with certificate content. eg: fs.createReadStream() |
| name | <code>string</code> | Integration name |
| description | <code>string</code> | Integration description |

<a name="CoreConsoleAPI+createAdobeIdIntegration"></a>

### coreConsoleAPI.createAdobeIdIntegration(organizationId, integrationDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new AdobeID Integration for an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationDetails | [<code>AdobeIdIntegrationDetails</code>](#AdobeIdIntegrationDetails) | Integration details |

<a name="CoreConsoleAPI+updateAdobeIdIntegration"></a>

### coreConsoleAPI.updateAdobeIdIntegration(organizationId, integrationId, integrationDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Update an AdobeID Integration for an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID to update |
| integrationDetails | [<code>AdobeIdIntegrationDetails</code>](#AdobeIdIntegrationDetails) | Integration details |

<a name="CoreConsoleAPI+subscribeAdobeIdIntegrationToServices"></a>

### coreConsoleAPI.subscribeAdobeIdIntegrationToServices(organizationId, integrationId, serviceInfo) ⇒ <code>Promise.&lt;Response&gt;</code>
Subscribe Organization AdobeId Integration to Services

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |
| serviceInfo | <code>object</code> | Information about the services like SDK Codes, licenseConfig and roles |

<a name="CoreConsoleAPI+subscribeEnterpriseIntegrationToServices"></a>

### coreConsoleAPI.subscribeEnterpriseIntegrationToServices(organizationId, integrationId, serviceInfo) ⇒ <code>Promise.&lt;Response&gt;</code>
Subscribe Organization Enterprise Integration to Services

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |
| serviceInfo | <code>object</code> | Information about the services like SDK Codes, licenseConfig and roles |

<a name="CoreConsoleAPI+getBindingsForIntegration"></a>

### coreConsoleAPI.getBindingsForIntegration(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
List certification bindings for an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+uploadAndBindCertificate"></a>

### coreConsoleAPI.uploadAndBindCertificate(organizationId, integrationId, certificate) ⇒ <code>Promise.&lt;Response&gt;</code>
Upload and bind a certificate to an Organization Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |
| certificate | <code>object</code> | A Readable stream with certificate content. eg: fs.createReadStream() |

<a name="CoreConsoleAPI+deleteBinding"></a>

### coreConsoleAPI.deleteBinding(organizationId, integrationId, bindingId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a certificate binding for an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |
| bindingId | <code>string</code> | Binding ID |

<a name="CoreConsoleAPI+getIntegration"></a>

### coreConsoleAPI.getIntegration(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get Integration details

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+getIntegrationSecrets"></a>

### coreConsoleAPI.getIntegrationSecrets(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get Integration secrets

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+deleteIntegration"></a>

### coreConsoleAPI.deleteIntegration(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+createIMSOrg"></a>

### coreConsoleAPI.createIMSOrg() ⇒ <code>Promise.&lt;Response&gt;</code>
Create an IMS Org

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  
<a name="CoreConsoleAPI+getAtlasApplicationPolicy"></a>

### coreConsoleAPI.getAtlasApplicationPolicy(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get Application Atlas Policy for an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+getAtlasQuotaUsage"></a>

### coreConsoleAPI.getAtlasQuotaUsage(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get Atlas quota usage for an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+validateApplicationName"></a>

### coreConsoleAPI.validateApplicationName(organizationId, applicationName) ⇒ <code>Promise.&lt;Response&gt;</code>
Validate App Registry (Exchange) Application name

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationName | <code>string</code> | Application name to validate |

<a name="CoreConsoleAPI+getApplicationById"></a>

### coreConsoleAPI.getApplicationById(organizationId, applicationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get App Registry (Exchange) Application details

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationId | <code>string</code> | Application ID |

<a name="CoreConsoleAPI+updateApplication"></a>

### coreConsoleAPI.updateApplication(organizationId, applicationId, applicationDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Update App Registry (Exchange) Application, application details are patched.

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationId | <code>string</code> | Application ID |
| applicationDetails | <code>object</code> | Application details to update |

<a name="CoreConsoleAPI+deleteApplication"></a>

### coreConsoleAPI.deleteApplication(organizationId, applicationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete App Registry (Exchange) Application

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationId | <code>string</code> | Application ID |

<a name="CoreConsoleAPI+getApplicationByName"></a>

### coreConsoleAPI.getApplicationByName(organizationId, applicationName) ⇒ <code>Promise.&lt;Response&gt;</code>
Get App Registry (Exchange) Application by name

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationName | <code>string</code> | Application Name |

<a name="CoreConsoleAPI+submitApplication"></a>

### coreConsoleAPI.submitApplication(organizationId, applicationId, submitterNotes) ⇒ <code>Promise.&lt;Response&gt;</code>
Submit an Application to App Registry (Exchange)

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationId | <code>string</code> | Application ID |
| submitterNotes | <code>string</code> | Notes from submitter |

<a name="CoreConsoleAPI+getAllApplicationsForUser"></a>

### coreConsoleAPI.getAllApplicationsForUser(organizationId, offset, pageSize) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all App Registry (Exchange) Application

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| offset | <code>number</code> | offset for returned list |
| pageSize | <code>number</code> | number of elements to return |

<a name="CoreConsoleAPI+uploadApplicationIcon"></a>

### coreConsoleAPI.uploadApplicationIcon(organizationId, applicationId, icon) ⇒ <code>Promise.&lt;Response&gt;</code>
Upload an Icon for an Application in App Registry (Exchange)

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |
| applicationId | <code>string</code> | Application Name |
| icon | <code>object</code> | A Readable stream with the Icon file content. eg: fs.createReadStream().        The icon must be of size 512x512 and of type png or jpg. |

<a name="CoreConsoleAPI+getAppRegistryHealth"></a>

### coreConsoleAPI.getAppRegistryHealth(organizationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get App Registry (Exchange) health

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization AMS ID |

<a name="createRequestOptions"></a>

## createRequestOptions(apiKey, options) ⇒ <code>Array</code>
Create request options compatible with the console swagger definition

**Kind**: global function  
**Returns**: <code>Array</code> - [{ swaggerParameters }, { requestBody }]  

| Param | Type | Description |
| --- | --- | --- |
| apiKey | <code>string</code> | apiKey to access console api |
| options | <code>object</code> | optional data used for building the request options |
| [options.parameters] | <code>object</code> | parameters to set to the request, specific to each endpoint |
| [options.body] | <code>object</code> | request body for the request |

<a name="requestInterceptorBuilder"></a>

## requestInterceptorBuilder(coreConsoleAPIInstance, apihost) ⇒ <code>function</code>
Build a swagger request interceptor for the console sdk

**Kind**: global function  
**Returns**: <code>function</code> - a request interceptor  

| Param | Type | Description |
| --- | --- | --- |
| coreConsoleAPIInstance | <code>object</code> | console core api instance |
| apihost | <code>string</code> | console api url host |

<a name="responseInterceptor"></a>

## responseInterceptor(res) ⇒ <code>object</code>
A swagger response interceptor for the console sdk

**Kind**: global function  
**Returns**: <code>object</code> - the response object  

| Param | Type | Description |
| --- | --- | --- |
| res | <code>object</code> | the response object |

<a name="init"></a>

## init(accessToken, apiKey, [env]) ⇒ [<code>Promise.&lt;CoreConsoleAPI&gt;</code>](#CoreConsoleAPI)
Returns a Promise that resolves with a new CoreConsoleAPI object

**Kind**: global function  
**Returns**: [<code>Promise.&lt;CoreConsoleAPI&gt;</code>](#CoreConsoleAPI) - a Promise with a CoreConsoleAPI object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accessToken | <code>string</code> |  | the access token corresponding to an integration or user token |
| apiKey | <code>string</code> |  | api key to access the Developer Console |
| [env] | <code>string</code> | <code>&quot;prod&quot;</code> | the server environment ('prod' or 'stage') |

<a name="ProjectDetails"></a>

## ProjectDetails : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name |
| title | <code>string</code> | Title |
| [who_created] | <code>string</code> | Creator name |
| [description] | <code>string</code> | Description |
| type | <code>string</code> | Type (default or jaeger) |

<a name="WorkspaceDetails"></a>

## WorkspaceDetails : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name |
| [title] | <code>string</code> | Title |
| [who_created] | <code>string</code> | Creator name |
| [description] | <code>string</code> | Description |
| [type] | <code>string</code> | Type |
| [quotaRule] | <code>string</code> | quotaRule |

<a name="AdobeIdIntegrationDetails"></a>

## AdobeIdIntegrationDetails : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name |
| description | <code>string</code> | Description |
| platform | <code>string</code> | Platform |
| [urlScheme] | <code>string</code> | url scheme |
| [redirectUriList] | <code>object</code> | List of redirect URIs |
| [defaultRedirectUri] | <code>string</code> | Default redirect URI |
| [domain] | <code>string</code> | domain |
| [approvalInfo] | <code>object</code> | approvalInfo |

### Debug Logs

```bash
LOG_LEVEL=debug <your_call_here>
```

Prepend the `LOG_LEVEL` environment variable and `debug` value to the call that invokes your function, on the command line. This should output a lot of debug data for your SDK calls.

### Contributing

Contributions are welcome! Read the [Contributing Guide](./.github/CONTRIBUTING.md) for more information.

### Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
