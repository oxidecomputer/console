import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import fetchMock from 'fetch-mock'
import { Response } from 'node-fetch'

import { org, orgs } from '@oxide/api-mocks'
import { useApiQuery, useApiMutation } from '../'
import { redirectToLogin } from '../login-redirect'
jest.mock('../login-redirect')

// because useApiQuery and useApiMutation are almost entirely typed wrappers
// around React Query's useQuery and useMutation, these tests are mostly about
// testing the one bit of real logic in there: error parsing

// make a whole new query client for every test. it was acting weird
const wrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

const renderGetOrgs = () =>
  renderHook(() => useApiQuery('organizationsGet', {}), wrapper())

const renderCreateOrg = () =>
  renderHook(() => useApiMutation('organizationsPost'), wrapper())

const createParams = {
  params: {},
  body: { name: 'abc', description: '', hello: 'a' },
}

afterEach(() => {
  fetchMock.reset()
})

describe('useApiQuery', () => {
  it('has correct initial state', () => {
    const { result } = renderGetOrgs()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeTruthy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const response = new Response('Not found', { status: 404 })
      fetchMock.get('/api/organizations', response)

      const { result } = renderGetOrgs()

      await waitFor(() => expect(result.current.error).toEqual(response))
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      const response = new Response(JSON.stringify(error), { status: 404 })
      fetchMock.get('/api/organizations', response)

      const { result } = renderGetOrgs()

      await waitFor(() => expect(result.current.error?.error).toEqual(error))
    })

    it('sets error.data to null if error body is not json', async () => {
      const response = new Response('not json', { status: 404 })
      fetchMock.get('/api/organizations', response)

      const { result } = renderGetOrgs()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })

    it('navigates to login if 401', async () => {
      fetchMock.get('/api/organizations', 401)
      renderGetOrgs()
      await waitFor(() => expect(redirectToLogin).toHaveBeenCalled())
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const response = new Response(JSON.stringify(orgs), { status: 200 })
      fetchMock.get('/api/organizations', response)

      const { result } = renderGetOrgs()

      await waitFor(() => expect(result.current.data).toEqual(orgs))
    })
  })
})

describe('useApiMutation', () => {
  it('has correct initial state', () => {
    const { result } = renderCreateOrg()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeFalsy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const response = new Response('Bad request', { status: 400 })
      fetchMock.post('/api/organizations', response)

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error).toEqual(response))
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      const response = new Response(JSON.stringify(error), { status: 400 })
      fetchMock.post('/api/organizations', response)

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error?.error).toEqual(error))
    })

    it('sets error.data to null if error body is not json', async () => {
      const response = new Response('not json', { status: 404 })
      fetchMock.post('/api/organizations', response)

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })

    it('navigates to login if 401', async () => {
      fetchMock.post('/api/organizations', 401)
      renderCreateOrg()
      await waitFor(() => expect(redirectToLogin).toHaveBeenCalled())
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const response = new Response(JSON.stringify(org), { status: 201 })
      fetchMock.post('/api/organizations', response)

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.data).toEqual(org))
    })
  })
})
