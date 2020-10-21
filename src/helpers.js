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
 * @param root0
 * @param root0.apiKey
 * @param root0.accessToken
 * @param root0.APISERVER
 * @param root0.params
 * @param root0.body
 */
function createRequestOptions ({ apiKey, params = {}, body }) {
  logger.debug(`params ${JSON.stringify(params)}`)
  return [
    {
      // 1. params
      ...params,
      'x-api-key': apiKey,
      // this is a fake value, the console json spec requires the parameter, however swagger-js
      // will not set it as Authorization should not be set via a parameter and is hence
      // ignored by the swagger spec, see
      // https://github.com/swagger-api/swagger-js/issues/1405 for more details.
      Authorization: 'donotthrowifmissing'
    },
    {
      requestBody: body
      // todo double check that I really do not need the APISERVER anymore
    }
  ]
}

/**
 * @param req
 */
function requestInterceptorBuilder (coreAPIInstance, apihost) {
  return (req) => {
    // change host based on env
    const url = new URL(req.url)
    url.host = apihost
    req.url = url.href

    req.headers['Content-Type'] = req.headers['Content-Type'] || 'application/json'
    req.headers.Authorization = `Bearer ${coreAPIInstance.accessToken}`
    logger.debug(`REQUEST:\n ${JSON.stringify(req, null, 2)}`)
    return req
  }
}

/**
 * @param res
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
