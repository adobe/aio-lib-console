
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

const { ErrorWrapper, createUpdater } = require('@adobe/aio-lib-core-errors').AioCoreSDKErrorWrapper

const codes = {}
const messages = new Map()

/**
 * Create an Updater for the Error wrapper
 *
 * @ignore
 */
const Updater = createUpdater(
  // object that stores the error classes (to be exported)
  codes,
  // Map that stores the error strings (to be exported)
  messages
)

/**
 * Provides a wrapper to easily create classes of a certain name, and values
 *
 * @ignore
 */
const E = ErrorWrapper(
  // The class name for your SDK Error. Your Error objects will be these objects
  'CoreConsoleAPIError',
  // The name of your SDK. This will be a property in your Error objects
  'CoreConsoleAPISDK',
  // the object returned from the CreateUpdater call above
  Updater
  // the base class that your Error class is extending. AioCoreSDKError is the default
  /* AioCoreSDKError, */
)

module.exports = {
  codes,
  messages
}

// Define your error codes with the wrapper
E('ERROR_SDK_INITIALIZATION', 'SDK initialization error(s). Missing arguments: %s')
E('ERROR_GET_PROJECTS_BY_ORG_ID', '%s')
E('ERROR_CREATE_PROJECT', '%s')
E('ERROR_GET_WORKSPACES_BY_PROJECT_ID', '%s')
E('ERROR_DELETE_PROJECT', '%s')
E('ERROR_EDIT_PROJECT', '%s')
E('ERROR_GET_PROJECT_BY_ID', '%s')
E('ERROR_DOWNLOAD_WORKSPACE_JSON', '%s')
E('ERROR_CREATE_WORKSPACE', '%s')
E('ERROR_EDIT_WORKSPACE', '%s')
E('ERROR_GET_WORKSPACE_BY_ID', '%s')
E('ERROR_DELETE_WORKSPACE', '%s')
E('ERROR_GET_INTEGRATIONS', '%s')
E('ERROR_CREATE_ENTERPRISE_INTEGRATION', '%s')
E('ERROR_CREATE_ANALYTICS_INTEGRATION', '%s')
E('ERROR_CREATE_ADOBEID_INTEGRATION', '%s')
E('ERROR_SUBSCRIBE_INTEGRATION_TO_SERVICES', '%s')
E('ERROR_GET_PROJECT_WORKSPACE_BY_INTEGRATION', '%s')
E('ERROR_GET_PROJECT_BY_WORKSPACE', '%s')
E('ERROR_DELETE_INTEGRATION', '%s')
E('ERROR_CREATE_ORGANIZATION', '%s')
E('ERROR_GET_ORGANIZATIONS', '%s')
E('ERROR_GET_SERVICES_FOR_ORG', '%s')
