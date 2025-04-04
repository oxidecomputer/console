/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { project } from '@oxide/api-mocks'

import { useApiMutation, useApiQuery } from '..'
import type { DiskCreate } from '../__generated__/Api'
import { overrideOnce } from '../../../test/unit/server'

// because useApiQuery and useApiMutation are almost entirely typed wrappers
// around React Query's useQuery and useMutation, these tests are mostly about
// testing the one bit of real logic in there: error parsing

const queryClientOptions = {
  defaultOptions: { queries: { retry: false } },
  // react-query calls console.error whenever a request fails. stop that
  logger: { ...console, error: () => {} },
}

export function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient(queryClientOptions)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const config = { wrapper: Wrapper }

const renderProjectList = () => renderHook(() => useApiQuery('projectList', {}), config)

// 503 is a special key in the MSW server that returns a 503
const renderGetProject503 = () =>
  renderHook(
    () => useApiQuery('projectView', { path: { project: 'project-error-503' } }),
    config
  )

const renderCreateProject = () => renderHook(() => useApiMutation('projectCreate'), config)

const createParams = {
  body: { name: 'abc', description: '', hello: 'a' },
}

describe('useApiQuery', () => {
  it('has correct initial state', () => {
    const { result } = renderProjectList()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeTruthy()
    expect(result.current.isPending).toBeTruthy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const { result } = renderGetProject503()

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.statusCode).toEqual(503)
    })

    it('parses error json if possible', async () => {
      const { result } = renderGetProject503()

      await waitFor(() =>
        expect(result.current.error).toMatchObject({ errorCode: 'ServiceUnavailable' })
      )
    })

    it('contains client_error if error body is not json', async () => {
      overrideOnce('get', 'http://testhost/v1/projects', 503, 'not json')

      const { result } = renderProjectList()

      await waitFor(() => {
        const error = result.current.error
        expect(error).toMatchObject({
          message: 'Error reading API response',
        })
      })
    })

    it('does not client_error if response body is empty', async () => {
      overrideOnce('get', 'http://testhost/v1/projects', 503, '')

      const { result } = renderProjectList()

      await waitFor(() => {
        const error = result.current.error
        expect(error).toMatchObject({
          statusCode: 503,
          message: 'Unknown server error',
        })
      })
    })
  })

  describe('on 404 response', () => {
    // This is a weird test. react-hooks-testing-library's renderHook used to
    // catch the error for us, so it was easy to assert about. Without that, I
    // wanted to render an ErrorBoundary, using the `onError` prop for the spy
    // and asserting that it got called. That worked, but jsdom considered the
    // error unhandled for some reason and filled the terminal with garbage. So
    // instead we just catch the exception directly in a way you would never
    // want to do in real code. Dubious!
    it('throws by default', async () => {
      const onError = vi.fn()

      function BadApiCall() {
        try {
          // this disable is for for oxlint
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useApiQuery('projectView', { path: { project: 'nonexistent' } })
        } catch (e) {
          onError(e)
        }
        return null
      }

      render(<BadApiCall />, config)

      await waitFor(() => {
        const error = onError.mock.lastCall?.[0]
        expect(error).toEqual({
          errorCode: 'ObjectNotFound',
          message: "Not found: project 'nonexistent'",
          statusCode: 404,
        })
      })
    })

    it('default throw behavior can be overridden to use query error state', async () => {
      const { result } = renderHook(
        () =>
          useApiQuery(
            'projectView',
            { path: { project: 'nonexistent' } },
            { throwOnError: false } // <----- the point
          ),
        config
      )

      await waitFor(() =>
        expect(result.current.error).toMatchObject({
          errorCode: 'ObjectNotFound',
        })
      )
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const { result } = renderProjectList()
      await waitFor(() => {
        const items = result.current.data?.items
        expect(items?.length).toEqual(2)
        expect(items?.[0].id).toEqual(project.id)
      })
    })

    // RQ doesn't like a value of undefined for data, so we're using {} for now
    it('returns success with empty object if response body is empty', async () => {
      overrideOnce('get', 'http://testhost/v1/projects', 201, '')

      const { result } = renderProjectList()

      await waitFor(() => {
        expect(result.current.data).toEqual({})
      })
    })
  })
})

describe('useApiMutation', () => {
  it('has correct initial state', () => {
    const { result } = renderCreateProject()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isPending).toBeFalsy()
  })

  describe('on error response', () => {
    const diskCreate: DiskCreate = {
      name: 'will-fail',
      description: '',
      diskSource: { type: 'blank', blockSize: 512 },
      size: 10,
    }
    const diskCreate404Params = {
      query: { project: 'nonexistent' },
      body: diskCreate,
    }

    it('passes through raw response', async () => {
      const { result } = renderHook(() => useApiMutation('diskCreate'), config)

      act(() => result.current.mutate(diskCreate404Params))

      await waitFor(() => expect(result.current.error).not.toBeNull())

      expect(result.current.error).toEqual({
        errorCode: 'ObjectNotFound',
        message: "Not found: project 'nonexistent'",
        statusCode: 404,
      })
    })

    it('parses error json if possible', async () => {
      const { result } = renderHook(() => useApiMutation('diskCreate'), config)

      act(() => result.current.mutate(diskCreate404Params))

      await waitFor(() =>
        expect(result.current.error).toMatchObject({
          errorCode: 'ObjectNotFound',
          statusCode: 404,
        })
      )
    })

    it('contains client_error if error body is not json', async () => {
      overrideOnce('post', 'http://testhost/v1/projects', 404, 'not json')

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        const error = result.current.error
        expect(error).toMatchObject({
          message: 'Error reading API response',
        })
        expect(error?.message).toEqual('Error reading API response')
      })
    })

    it('does not client_error if response body is empty', async () => {
      overrideOnce('post', 'http://testhost/v1/projects', 503, '')

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        const error = result.current.error
        expect(error).toMatchObject({
          message: 'Unknown server error',
        })
      })
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          name: createParams.body.name,
        })
      )
    })

    // RQ doesn't like a value of undefined for data, so we're using {} for now
    it('returns success with empty object if response body is empty', async () => {
      overrideOnce('post', 'http://testhost/v1/projects', 201, '')

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        expect(result.current.data).toEqual({})
      })
    })
  })
})
