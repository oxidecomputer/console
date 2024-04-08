/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { getParseError, getResourceName, processServerError } from '../errors'

describe('getParseError', () => {
  it('extracts nice part of error message', () => {
    expect(
      getParseError('unable to parse JSON body: hi, you have an error at line 129 column 4')
    ).toEqual('Hi, you have an error')
  })

  it('returns undefined if error does not match pattern', () => {
    expect(getParseError('some nonsense')).toBeUndefined()
  })
})

describe('processServerError', () => {
  const makeError = ({
    status = 400,
    errorCode = 'ObjectAlreadyExists',
    message = 'already exists: instance "instance-name"',
  } = {}) => ({
    type: 'error' as const,
    response: new Response(undefined, { status }),
    data: { requestId: '2', errorCode, message },
  })

  it('extracts message from parse errors', () => {
    const parseError = {
      type: 'error' as const,
      response: new Response(undefined, { status: 400 }),
      data: {
        requestId: '1',
        message: 'unable to parse JSON body: hi, you have an error at line 129 column 4',
      },
    }
    expect(processServerError('fakeThingView', parseError)).toEqual({
      code: undefined,
      message: 'Hi, you have an error',
      statusCode: 400,
      errorCode: undefined,
      requestId: '1',
    })
  })

  it('handles client errors', () => {
    const clientError = {
      type: 'client_error' as const,
      response: new Response(undefined, { status: 200 }),
      text: 'this was not json',
      error: new Error('failed to parse JSON'),
    }
    expect(processServerError('fakeThingView', clientError)).toEqual({
      message: 'Error reading API response',
      statusCode: 200,
    })
  })

  describe('ObjectAlreadyExists', () => {
    it('pulls resource name from message', () => {
      expect(processServerError('fakeThingCreate', makeError())).toEqual({
        errorCode: 'ObjectAlreadyExists',
        message: 'Instance name already exists',
        statusCode: 400,
        requestId: '2',
      })
    })

    it('pulls from method name if message does not work', () => {
      const error = makeError({ message: 'whatever' })
      expect(processServerError('fakeThingCreate', error)).toEqual({
        errorCode: 'ObjectAlreadyExists',
        message: 'Thing name already exists',
        statusCode: 400,
        requestId: '2',
      })
    })
  })

  describe('ObjectNotFound', () => {
    it('passes through the API error', () => {
      const error = makeError({
        errorCode: 'ObjectNotFound',
        message: 'not found: whatever',
        status: 404,
      })
      expect(processServerError('fakeThingCreate', error)).toEqual({
        errorCode: 'ObjectNotFound',
        message: 'Not found: whatever',
        statusCode: 404,
        requestId: '2',
      })
    })
  })

  it('falls back to server error message if code not found', () => {
    const error = makeError({ errorCode: 'WeirdError', message: 'whatever' })
    expect(processServerError('womp', error)).toEqual({
      errorCode: 'WeirdError',
      message: 'Whatever',
      statusCode: 400,
      requestId: '2',
    })
  })
})

it.each([
  ['projectCreate', '', 'project'],
  ['projectCreate', 'already exists: project "abc"', 'project'],
  ['instanceCreate', 'already exists: disk "abc"', 'disk'],
  ['instanceNetworkInterfaceCreate', '', 'interface'],
  ['instanceNetworkInterfaceCreate', 'already exists: something else', 'something else'],
  ['doesNotContainC-reate', '', null],
])('getResourceName: %s', (method, message, resource) => {
  expect(getResourceName(method, message)).toEqual(resource)
})
