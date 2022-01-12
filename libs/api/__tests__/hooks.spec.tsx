import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'

import { override } from 'app/test-utils'
import { org, orgs } from '@oxide/api-mocks'
import { useApiQuery, useApiMutation } from '../'

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

const renderGetOrg = () =>
  renderHook(
    () =>
      useApiQuery('organizationsGetOrganization', { orgName: 'nonexistent' }),
    wrapper()
  )

const renderCreateOrg = () =>
  renderHook(() => useApiMutation('organizationsPost'), wrapper())

const createParams = {
  params: {},
  body: { name: 'abc', description: '', hello: 'a' },
}

describe('useApiQuery', () => {
  it('has correct initial state', () => {
    const { result } = renderGetOrgs()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeTruthy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const { result } = renderGetOrg()

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.status).toEqual(404)
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      override('get', '/api/organizations', 404, error)

      const { result } = renderGetOrgs()

      await waitFor(() => expect(result.current.error?.error).toEqual(error))
    })

    // TODO: this test applies to the old generated client. now it's more like
    // data is null. error appears to get the JSON parse error for some reason
    it('sets error.data to null if error body is not json', async () => {
      override('get', '/api/organizations', 404, 'not json')

      const { result } = renderGetOrgs()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
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
      override('post', '/api/organizations', 404, 'not json')

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.status).toEqual(404)
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      override('post', '/api/organizations', 400, error)

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error?.error).toEqual(error))
    })

    it('sets error.data to null if error body is not json', async () => {
      override('post', '/api/organizations', 404, 'not json')

      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const { result } = renderCreateOrg()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.data).toEqual(org))
    })
  })
})
