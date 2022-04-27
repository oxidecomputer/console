import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'

import { overrideOnce, Wrapper } from 'app/test/utils'
import { org } from '@oxide/api-mocks'
import type { ErrorResponse } from '../'
import { useApiQuery, useApiMutation } from '../'

// because useApiQuery and useApiMutation are almost entirely typed wrappers
// around React Query's useQuery and useMutation, these tests are mostly about
// testing the one bit of real logic in there: error parsing

const config = { wrapper: Wrapper }

const renderGetOrgs = () => renderHook(() => useApiQuery('organizationsGet', {}), config)

// 503 is a special key in the MSW server that returns a 503
const renderGetOrg503 = () =>
  renderHook(() => useApiQuery('organizationsGetOrganization', { orgName: '503' }), config)

const renderCreateOrg = () => renderHook(() => useApiMutation('organizationsPost'), config)

const createParams = {
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
      const { result } = renderGetOrg503()

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.status).toEqual(503)
    })

    it('parses error json if possible', async () => {
      const { result } = renderGetOrg503()

      await waitFor(() =>
        expect(result.current.error?.error).toMatchObject({
          errorCode: 'ServiceUnavailable',
        })
      )
    })

    // TODO: this test applies to the old generated client. now it's more like
    // data is null. error appears to get the JSON parse error for some reason
    it('sets error.data to null if error body is not json', async () => {
      overrideOnce('get', '/api/organizations', 503, 'not json')

      const { result } = renderGetOrgs()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })
  })

  describe('on 404 response', () => {
    it('throws by default', async () => {
      const { result } = renderHook(
        () =>
          useApiQuery('organizationsGetOrganization', {
            orgName: 'nonexistent',
          }),
        config
      )

      // The error is thrown asynchronously by the hook so it can propagate up
      // the tree. Fortunately result.error exists for precisely this use case.
      await waitFor(() => {
        const error = result.error as ErrorResponse | undefined
        expect(error?.status).toEqual(404)
        expect(error?.error).toMatchObject({ errorCode: 'ObjectNotFound' })
      })
    })

    it('default throw behavior can be overridden to use query error state', async () => {
      const { result } = renderHook(
        () =>
          useApiQuery(
            'organizationsGetOrganization',
            { orgName: 'nonexistent' },
            { useErrorBoundary: false } // <----- the point
          ),
        config
      )

      await waitFor(() =>
        expect(result.current.error?.error).toMatchObject({
          errorCode: 'ObjectNotFound',
        })
      )
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const { result } = renderGetOrgs()
      await waitFor(() => {
        const items = result.current.data?.items
        expect(items?.length).toEqual(1)
        expect(items?.[0].id).toEqual(org.id)
      })
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
    const projectPost404Params = {
      orgName: 'nonexistent',
      body: { name: 'will-fail', description: '' },
    }

    it('passes through raw response', async () => {
      const { result } = renderHook(
        () => useApiMutation('organizationProjectsPost'),
        config
      )

      act(() => result.current.mutate(projectPost404Params))

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.status).toEqual(404)
    })

    it('parses error json if possible', async () => {
      const { result } = renderHook(
        () => useApiMutation('organizationProjectsPost'),
        config
      )

      act(() => result.current.mutate(projectPost404Params))

      await waitFor(() =>
        expect(result.current.error?.error).toMatchObject({
          errorCode: 'ObjectNotFound',
        })
      )
    })

    it('sets error.data to null if error body is not json', async () => {
      overrideOnce('post', '/api/organizations', 404, 'not json')

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

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          name: createParams.body.name,
        })
      )
    })
  })
})
