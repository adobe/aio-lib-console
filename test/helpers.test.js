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
const AioLogger = require('@adobe/aio-lib-core-logging')
const helpers = require('../src/helpers')
const { reduceError } = require('../src/helpers')

test('reduceError', () => {
  // no args produces empty object
  expect(reduceError()).toEqual({})

  // unexpected properties returns the same error with no reduction
  const unexpectedError = { foo: 'bar' }
  expect(reduceError(unexpectedError)).toEqual(unexpectedError)

  // inadequate properties returns the same error with no reduction
  const unexpectedError2 = { foo: 'bar', response: {} }
  expect(reduceError(unexpectedError2)).toEqual(unexpectedError2)

  // expected properties returns the object reduced to a string
  const expectedError = {
    response: {
      status: 500,
      statusText: 'Something went gang aft agley.',
      body: {
        error_code: 500101,
        message: 'I\'m giving it all I got, cap\'n'
      }
    }
  }
  expect(reduceError(expectedError)).toEqual("500 - Something went gang aft agley. ({\"error_code\":500101,\"message\":\"I'm giving it all I got, cap'n\"})")
})

describe('createRequestOptions', () => {
  test('(apiKey, {})', () => {
    expect(helpers.createRequestOptions('apiKey', {})).toEqual([{
      'x-api-key': 'apiKey',
      Authorization: '__placeholder__'
    }, {
      requestBody: undefined
    }])
  })
  test('(apiKey, { parameters: { hello: 1, x-api-key: new } })', () => {
    expect(helpers.createRequestOptions('apiKey', { parameters: { hello: 1, 'x-api-key': 'new' } })).toEqual([{
      'x-api-key': 'new',
      Authorization: '__placeholder__',
      hello: 1
    }, {
      requestBody: undefined
    }])
  })

  test('(apiKey, { parameters: { hello: 1, hola: 2 }, body: { bonjour: 3, gutenTag: 4 } })', () => {
    expect(helpers.createRequestOptions('apiKey', { parameters: { hello: 1, hola: 2 }, body: { bonjour: 3, gutenTag: 4 } })).toEqual([{
      'x-api-key': 'apiKey',
      Authorization: '__placeholder__',
      hello: 1,
      hola: 2
    }, {
      requestBody: {
        bonjour: 3,
        gutenTag: 4
      }
    }])
  })
})

test('requestInterceptorBuilder', () => {
  const reqInterceptor = helpers.requestInterceptorBuilder({ accessToken: '123' }, 'theapihost.com')

  expect(reqInterceptor({ url: 'https://example.com/hello/from/the?world=2', headers: {} })).toEqual({
    url: 'https://theapihost.com/hello/from/the?world=2',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer 123'
    }
  })

  expect(reqInterceptor({ url: 'https://example.com/hello/from/the?world=2', headers: { 'Content-Type': 'someother' } })).toEqual({
    url: 'https://theapihost.com/hello/from/the?world=2',
    headers: {
      'Content-Type': 'someother',
      Authorization: 'Bearer 123'
    }
  })
})

describe('responseInterceptor', () => {
  beforeEach(() => {
    AioLogger.mockReset()
  })
  test('not json', () => {
    const res = { ok: true, text: Buffer.from('hello yall') }
    helpers.responseInterceptor({ ok: true, text: Buffer.from('hello yall') })
    expect(AioLogger.debug).toHaveBeenCalledWith(`RESPONSE:\n${JSON.stringify(res, null, 2)}`)
    expect(AioLogger.debug).toHaveBeenCalledWith('DATA:\nhello yall')
  })
  test('json', () => {
    const res = { ok: true, text: Buffer.from('{"hello": "yall"}') }
    helpers.responseInterceptor({ ok: true, text: Buffer.from('{"hello": "yall"}') })
    expect(AioLogger.debug).toHaveBeenCalledWith(`RESPONSE:\n${JSON.stringify(res, null, 2)}`)
    expect(AioLogger.debug).toHaveBeenCalledWith('DATA:\n{\n  "hello": "yall"\n}')
  })
  test('not ok', () => {
    const res = { ok: false, text: Buffer.from('this is an error response') }
    helpers.responseInterceptor({ ok: false, text: Buffer.from('this is an error response') })
    expect(AioLogger.debug).toHaveBeenCalledWith(`RESPONSE:\n${JSON.stringify(res, null, 2)}`)
    expect(AioLogger.debug).toHaveBeenCalledTimes(1)
  })
})
