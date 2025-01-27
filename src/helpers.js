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
const loggerNamespace = '@adobe/aio-lib-console'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { provider: 'debug', level: process.env.LOG_LEVEL || 'debug' })
const axios = require('axios')
const FormData = require('form-data')

/**
 * Reduce an Error to a string
 *
 * @private
 * @param {Error} error the Error object to reduce
 * @returns {string} string reduced from an Error
 */
function reduceError (error = {}) {
  const response = error.response
  if (response) {
    if (response.status && response.statusText && response.body) {
      return `${response.status} - ${response.statusText} (${JSON.stringify(response.body)})`
    }
  }

  return error
}

/**
 * Create request options compatible with the console swagger definition
 *
 * @param {string} apiKey apiKey to access console api
 * @param {object} options optional data used for building the request options
 * @param {object} [options.parameters] parameters to set to the request, specific to each endpoint
 * @param {object} [options.body] request body for the request
 * @returns {Array} [{ swaggerParameters }, { requestBody }]
 */
function createRequestOptions (apiKey, { parameters = {}, body }) {
  logger.debug(`params ${JSON.stringify(parameters)}`)
  logger.debug(`params ${JSON.stringify(body)}`)
  return [
    {
      'x-api-key': apiKey,
      // This is a fake value, the console swagger spec requires the Authorization parameter
      // to be set. We cannot set the actual access token here because swagger-js ignores
      // the value as Authorization header parameters are ignored by swagger.
      // See https://github.com/swagger-api/swagger-js/issues/1405 for more details.
      Authorization: '__placeholder__',
      ...parameters
    },
    {
      requestBody: body
    }
  ]
}

/**
 * Build a swagger request interceptor for the console sdk
 *
 * @param {object} coreConsoleAPIInstance console core api instance
 * @param {string} apihost console api url host
 * @returns {Function} a request interceptor
 */
function requestInterceptorBuilder (coreConsoleAPIInstance, apihost) {
  return (req) => {
    // change host based on env
    const url = new URL(req.url)
    url.host = apihost
    req.url = url.href

    req.headers['Content-Type'] = req.headers['Content-Type'] || 'application/json'
    req.headers.Authorization = `Bearer ${coreConsoleAPIInstance.accessToken}`
    // In the api.json definition some endpoints don't have the `api-key` parameter
    // defined (e.g in /apps), meaning the header will not be set as
    // part of `createRequestOptions` and hence must be manually set here
    req.headers['x-api-key'] = req.headers['x-api-key'] || coreConsoleAPIInstance.apiKey

    logger.debug(`REQUEST:\n ${JSON.stringify(req, null, 2)}`)
    return req
  }
}

/**
 * A swagger response interceptor for the console sdk
 *
 * @param {object} res the response object
 * @returns {object} the response object
 */
function responseInterceptor (res) {
  logger.debug(`RESPONSE:\n${JSON.stringify(res, null, 2)}`)
  if (res.ok) {
    const text = res.text.toString('utf-8')
    try {
      logger.debug(`DATA:\n${JSON.stringify(JSON.parse(text), null, 2)}`)
    } catch (e) {
      logger.debug(`DATA:\n${text}`)
    }
  }
  return res
}

/**
 * Use axios lib to directly call console API to create credential
 *
 * @param {string} url URL string
 * @param {string} accessToken Token to call the API
 * @param {string} apiKey Api key
 * @param {object} certificate A Readable stream with certificate content. eg: fs.createReadStream()
 * @param {string} name Credential name
 * @param {string} description Credential description
 * @returns {object} The response object
 */
async function createCredentialDirect (url, accessToken, apiKey, certificate, name, description) {
  const data = new FormData()
  data.append('certificate', certificate)
  data.append('name', name)
  data.append('description', description)

  const config = {
    method: 'post',
    url,
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'content-type': 'multipart/form-data',
      'x-api-key': apiKey
    },
    data
  }
  return await axios.request(config)
}

module.exports = {
  reduceError,
  requestInterceptorBuilder,
  responseInterceptor,
  createRequestOptions,
  createCredentialDirect
}
