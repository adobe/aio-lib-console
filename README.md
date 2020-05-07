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
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/aio-lib-console.svg)](https://greenkeeper.io/)
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
  const client = await sdk.init('x-api-key', '<valid auth token>')
}
```

2) Call methods using the initialized SDK

```javascript
const sdk = require('@adobe/aio-lib-console')

async function sdkTest() {
  // initialize sdk
  const client = await sdk.init('x-api-key', '<valid auth token>')

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
<dt><a href="#IntegrationDetails">IntegrationDetails</a> : <code>object</code></dt>
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
    * [.getIntegrations(organizationId, projectId, workspaceId)](#CoreConsoleAPI+getIntegrations) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createEnterpriseIntegration(organizationId, projectId, workspaceId, certificate, name, description)](#CoreConsoleAPI+createEnterpriseIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.createAdobeIdIntegration(organizationId, projectId, workspaceId, integrationDetails)](#CoreConsoleAPI+createAdobeIdIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.subscribeIntegrationToServices(organizationId, projectId, workspaceId, integrationType, integrationId, serviceInfo)](#CoreConsoleAPI+subscribeIntegrationToServices) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getWorkspaceForIntegration(organizationId, integrationId)](#CoreConsoleAPI+getWorkspaceForIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getProjectForWorkspace(organizationId, workspaceId)](#CoreConsoleAPI+getProjectForWorkspace) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.deleteIntegration(organizationId, projectId, workspaceId, integrationType, integrationId)](#CoreConsoleAPI+deleteIntegration) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getOrganizations()](#CoreConsoleAPI+getOrganizations) ⇒ <code>Promise.&lt;Response&gt;</code>

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
| organizationId | <code>string</code> | Organization ID |

<a name="CoreConsoleAPI+createProject"></a>

### coreConsoleAPI.createProject(organizationId, projectDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Project in an Organization

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectDetails | [<code>ProjectDetails</code>](#ProjectDetails) | Project details including name, title, who_created, description and type |

<a name="CoreConsoleAPI+getWorkspacesForProject"></a>

### coreConsoleAPI.getWorkspacesForProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Workspaces for a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+deleteProject"></a>

### coreConsoleAPI.deleteProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+editProject"></a>

### coreConsoleAPI.editProject(organizationId, projectId, projectDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Edit a Project

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| projectDetails | [<code>ProjectDetails</code>](#ProjectDetails) | Project details including name, title, who_created, description and type |

<a name="CoreConsoleAPI+getProject"></a>

### coreConsoleAPI.getProject(organizationId, projectId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get a Project by ID

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |

<a name="CoreConsoleAPI+downloadWorkspaceJson"></a>

### coreConsoleAPI.downloadWorkspaceJson(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Download the Workspace Configuration File (json)

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+createWorkspace"></a>

### coreConsoleAPI.createWorkspace(organizationId, projectId, workspaceDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceDetails | [<code>WorkspaceDetails</code>](#WorkspaceDetails) | Workspace details including name, title, who_created, description, type and quotaRule |

<a name="CoreConsoleAPI+editWorkspace"></a>

### coreConsoleAPI.editWorkspace(organizationId, projectId, workspaceId, workspaceDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Edit a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
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
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+deleteWorkspace"></a>

### coreConsoleAPI.deleteWorkspace(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+getIntegrations"></a>

### coreConsoleAPI.getIntegrations(organizationId, projectId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Integrations for a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+createEnterpriseIntegration"></a>

### coreConsoleAPI.createEnterpriseIntegration(organizationId, projectId, workspaceId, certificate, name, description) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new Enterprise Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| certificate | <code>Buffer</code> | Certificate |
| name | <code>string</code> | Integration name |
| description | <code>string</code> | Integration description |

<a name="CoreConsoleAPI+createAdobeIdIntegration"></a>

### coreConsoleAPI.createAdobeIdIntegration(organizationId, projectId, workspaceId, integrationDetails) ⇒ <code>Promise.&lt;Response&gt;</code>
Create a new AdobeID Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| integrationDetails | [<code>IntegrationDetails</code>](#IntegrationDetails) | Integration details |

<a name="CoreConsoleAPI+subscribeIntegrationToServices"></a>

### coreConsoleAPI.subscribeIntegrationToServices(organizationId, projectId, workspaceId, integrationType, integrationId, serviceInfo) ⇒ <code>Promise.&lt;Response&gt;</code>
Subscribe an Integration to Services

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| integrationType | <code>string</code> | Integration type (adobeid, analytics or entp) |
| integrationId | <code>string</code> | Integration ID |
| serviceInfo | <code>object</code> | Information about the services like SDK Codes, licenseConfig and roles |

<a name="CoreConsoleAPI+getWorkspaceForIntegration"></a>

### coreConsoleAPI.getWorkspaceForIntegration(organizationId, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get the Workspace for an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+getProjectForWorkspace"></a>

### coreConsoleAPI.getProjectForWorkspace(organizationId, workspaceId) ⇒ <code>Promise.&lt;Response&gt;</code>
Get the Project of a Workspace

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| workspaceId | <code>string</code> | Workspace ID |

<a name="CoreConsoleAPI+deleteIntegration"></a>

### coreConsoleAPI.deleteIntegration(organizationId, projectId, workspaceId, integrationType, integrationId) ⇒ <code>Promise.&lt;Response&gt;</code>
Delete an Integration

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  

| Param | Type | Description |
| --- | --- | --- |
| organizationId | <code>string</code> | Organization ID |
| projectId | <code>string</code> | Project ID |
| workspaceId | <code>string</code> | Workspace ID |
| integrationType | <code>string</code> | Integration type (adobeid, analytics or entp) |
| integrationId | <code>string</code> | Integration ID |

<a name="CoreConsoleAPI+getOrganizations"></a>

### coreConsoleAPI.getOrganizations() ⇒ <code>Promise.&lt;Response&gt;</code>
Get all Organizations

**Kind**: instance method of [<code>CoreConsoleAPI</code>](#CoreConsoleAPI)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - the response  
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
| description | <code>string</code> | Description |
| type | <code>string</code> | Type |

<a name="WorkspaceDetails"></a>

## WorkspaceDetails : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name |
| [title] | <code>string</code> | Title |
| [who_created] | <code>string</code> | Creator name |
| description | <code>string</code> | Description |
| [type] | <code>string</code> | Type |
| [quotaRule] | <code>string</code> | quotaRule |

<a name="IntegrationDetails"></a>

## IntegrationDetails : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name |
| description | <code>string</code> | Description |
| [platform] | <code>string</code> | Platform |
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
