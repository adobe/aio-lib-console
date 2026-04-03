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
const stream = require('stream')
const mockedStream = new stream.Readable()
mockedStream._read = function (size) { /* do nothing */ }

test('reduceError', () => {
  // no args produces empty object
  expect(helpers.reduceError()).toEqual({})

  // unexpected properties returns the same error with no reduction
  const unexpectedError = { foo: 'bar' }
  expect(helpers.reduceError(unexpectedError)).toEqual(unexpectedError)

  // inadequate properties returns the same error with no reduction
  const unexpectedError2 = { foo: 'bar', response: {} }
  expect(helpers.reduceError(unexpectedError2)).toEqual(unexpectedError2)

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
  expect(helpers.reduceError(expectedError)).toEqual("500 - Something went gang aft agley. ({\"error_code\":500101,\"message\":\"I'm giving it all I got, cap'n\"})")

  const expectedErrorWithHeaders = {
    response: {
      status: 418,
      statusText: 'Tried making coffee in a teapot!',
      body: {
        error_code: 418001,
        message: 'Reinstall beans and try again.'
      },
      headers: { 'x-coffee-error': 'true', 'x-request-id': 'uuid-abc-def-ghi-123' }
    }
  }
  expect(helpers.reduceError(expectedErrorWithHeaders)).toEqual('418 - Tried making coffee in a teapot! ({"error_code":418001,"message":"Reinstall beans and try again."}) - Headers: [ x-request-id=uuid-abc-def-ghi-123 ]')

  const expectedErrorWithNoRelevantHeaders = {
    response: {
      status: 418,
      statusText: 'Tried making coffee in a teapot!',
      body: {
        error_code: 418001,
        message: 'Reinstall beans and try again.'
      },
      headers: { 'x-coffee-error': 'true' }
    }
  }
  expect(helpers.reduceError(expectedErrorWithNoRelevantHeaders)).toEqual('418 - Tried making coffee in a teapot! ({"error_code":418001,"message":"Reinstall beans and try again."})')

  const expectedErrorWithEmptyHeaders = {
    response: {
      status: 418,
      statusText: 'Tried making coffee in a teapot!',
      body: {
        error_code: 418001,
        message: 'Reinstall beans and try again.'
      },
      headers: { }
    }
  }
  expect(helpers.reduceError(expectedErrorWithEmptyHeaders)).toEqual('418 - Tried making coffee in a teapot! ({"error_code":418001,"message":"Reinstall beans and try again."})')
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
  const reqInterceptor = helpers.requestInterceptorBuilder({ accessToken: '123', apiKey: '456' }, 'theapihost.com')

  expect(reqInterceptor({ url: 'https://example.com/hello/from/the?world=2', headers: {} })).toEqual({
    url: 'https://theapihost.com/hello/from/the?world=2',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer 123',
      'x-api-key': '456'
    }
  })

  expect(reqInterceptor({ url: 'https://example.com/hello/from/the?world=2', headers: { 'Content-Type': 'someother', 'x-api-key': '789' } })).toEqual({
    url: 'https://theapihost.com/hello/from/the?world=2',
    headers: {
      'Content-Type': 'someother',
      Authorization: 'Bearer 123',
      'x-api-key': '789'
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

describe('createCredentialDirect', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200 })
  })
  afterEach(() => {
    fetchSpy.mockRestore()
  })
  test('API call', async () => {
    const url = 'mockurl'
    const accessToken = 'mockToken'
    const apiKey = 'mockKey'
    const name = 'mockName'
    const desc = 'mock description'
    const certStream = stream.Readable.from(Buffer.from('cert-data'))
    const ret = await helpers.createCredentialDirect(url, accessToken, apiKey, certStream, name, desc)
    expect(fetchSpy).toHaveBeenCalledWith(url, expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer mockToken',
        'x-api-key': 'mockKey'
      })
    }))
    expect(ret).toEqual({ ok: true, status: 200 })
  })
  test('API call with string chunks', async () => {
    const url = 'mockurl'
    const accessToken = 'mockToken'
    const apiKey = 'mockKey'
    const name = 'mockName'
    const desc = 'mock description'
    const certStream = stream.Readable.from('cert-data-string')
    const ret = await helpers.createCredentialDirect(url, accessToken, apiKey, certStream, name, desc)
    expect(fetchSpy).toHaveBeenCalled()
    expect(ret).toEqual({ ok: true, status: 200 })
  })
  test('throws on non-2xx response', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValue('{"error":"unauthorized"}'),
      headers: new Headers({ 'x-request-id': 'req-123' })
    })
    const certStream = stream.Readable.from(Buffer.from('cert-data'))
    await expect(helpers.createCredentialDirect('mockurl', 'mockToken', 'mockKey', certStream, 'mockName', 'mock description'))
      .rejects.toMatchObject({
        message: '401 Unauthorized',
        response: {
          status: 401,
          statusText: 'Unauthorized',
          body: '{"error":"unauthorized"}',
          headers: { 'x-request-id': 'req-123' }
        }
      })
  })
})
