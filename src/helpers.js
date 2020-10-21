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
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL || 'debug' })

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
 * @param {object} [options] optional data used for building the request options
 * @param {object} [options.parameters] parameters to set to the request, specific to each endpoint
 * @param {object} [options.body] request body for the request
 * @returns {Array} [{ swaggerParameters }, { requestBody }]
 */
function createRequestOptions (apiKey, { parameters = {}, body }) {
  logger.debug(`params ${JSON.stringify(parameters)}`)
  logger.debug(`params ${JSON.stringify(body)}`)
  return [
    {
      ...parameters,
      'x-api-key': apiKey,
      // This is a fake value, the console swagger spec requires the Authorization parameter
      // to be set. We cannot set the actual access token here because swagger-js ignores
      // the value as Authorization header parameters are ignored by swagger.
      // It is actually a bug in the console swagger spec.
      // See https://github.com/swagger-api/swagger-js/issues/1405 for more details.
      Authorization: 'donotthrowifmissing'
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
 *
 */
function requestInterceptorBuilder (coreConsoleAPIInstance, apihost) {
  return (req) => {
    // change host based on env
    const url = new URL(req.url)
    url.host = apihost
    req.url = url.href

    req.headers['Content-Type'] = req.headers['Content-Type'] || 'application/json'
    req.headers.Authorization = `Bearer ${coreConsoleAPIInstance.accessToken}`
    logger.debug(`REQUEST:\n ${JSON.stringify(req, null, 2)}`)
    return req
  }
}

/**
 * A swagger response interceptor for the console sdk
 *
 * @param {object} res the response object
 * @returns {object} the response object
 *
 */
function responseInterceptor (res) {
  logger.debug(`RESPONSE:\n ${JSON.stringify(res, null, 2)}`)
  if (res.ok) {
    const text = res.text.toString('utf-8')
    try {
      logger.debug(`DATA\n, ${JSON.stringify(JSON.parse(text), null, 2)}`)
    } catch (e) {
      logger.debug(`DATA\n ${text}`)
    }
  }
  return res
}

module.exports = {
  reduceError,
  requestInterceptorBuilder,
  responseInterceptor,
  createRequestOptions
}
