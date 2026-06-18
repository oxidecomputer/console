/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { project } from '@oxide/api-mocks'

import { api, q } from '..'
import { overrideOnce } from '../../../test/unit/server'
import { processServerError } from '../errors'

// useApiQuery and useApiMutation are almost entirely typed wrappers around React
// Query's useQuery and useMutation, so they're exercised end-to-end by the
// Playwright suite (every error toast goes through this path). The logic worth
// unit-testing directly is response parsing in the generated client
// (`handleResponse`) and the error transformation in `processServerError` (the
// latter is covered exhaustively in errors.spec.ts). These tests call the API
// methods directly — no React, no renderHook — since they return an ApiResult.

describe('API response parsing', () => {
  it('returns success data for a normal response', async () => {
    const result = await api.projectList({})
    expect(result.type).toEqual('success')
    if (result.type !== 'success') return
    expect(result.data.items.length).toEqual(3)
    expect(result.data.items[0].id).toEqual(project.id)
  })

  it('passes through error responses with status and parsed body', async () => {
    // project-error-503 is a sentinel in the MSW handlers that returns a 503
    const result = await api.projectView({ path: { project: 'project-error-503' } })
    expect(result.type).toEqual('error')
    if (result.type !== 'error') return
    expect(result.response.status).toEqual(503)
    expect(processServerError('projectView', result)).toMatchObject({
      errorCode: 'ServiceUnavailable',
      statusCode: 503,
    })
  })

  it('produces a client_error when the body is not JSON', async () => {
    overrideOnce('get', 'http://testhost/v1/projects', 503, 'not json')

    const result = await api.projectList({})
    expect(result.type).toEqual('client_error')
    if (result.type !== 'client_error') return
    expect(processServerError('projectList', result)).toMatchObject({
      message: 'Error reading API response',
    })
  })

  it('treats an empty error body as a server error rather than a client_error', async () => {
    overrideOnce('get', 'http://testhost/v1/projects', 503, '')

    const result = await api.projectList({})
    expect(result.type).toEqual('error')
    if (result.type !== 'error') return
    expect(processServerError('projectList', result)).toMatchObject({
      statusCode: 503,
      message: 'Unknown server error',
    })
  })

  // RQ doesn't like a value of undefined for data, so handleResponse uses {} for
  // an empty success body
  it('returns empty object for an empty success body', async () => {
    overrideOnce('get', 'http://testhost/v1/projects', 201, '')

    const result = await api.projectList({})
    expect(result.type).toEqual('success')
    if (result.type !== 'success') return
    expect(result.data).toEqual({})
  })
})

// we're relying on the name property of the API method for the queryKey, so we
// need to make sure nothing changes in the generated client to cause the API
// methods to not have a name
it('apiq queryKey', () => {
  const params = { path: { silo: 'abc' } }
  const queryOptions = q(api.siloView, params)
  expect(queryOptions.queryKey).toEqual(['siloView', params])
})
