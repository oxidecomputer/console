import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'

import { override, Wrapper } from 'app/test/utils'
import { org } from '@oxide/api-mocks'
import { useApiQuery, useApiMutation } from '../'

// because useApiQuery and useApiMutation are almost entirely typed wrappers
// around React Query's useQuery and useMutation, these tests are mostly about
// testing the one bit of real logic in there: error parsing

const config = { wrapper: Wrapper }

const renderGetOrgs = () =>
  renderHook(() => useApiQuery('organizationsGet', {}), config)

const renderGetNonexistentOrg = () =>
  renderHook(
    () =>
      useApiQuery('organizationsGetOrganization', { orgName: 'nonexistent' }),
    config
  )

const renderCreateOrg = () =>
  renderHook(() => useApiMutation('organizationsPost'), config)

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
      const { result } = renderGetNonexistentOrg()

      await waitFor(() => expect(result.current.error).not.toBeNull())

      const response = result.current.error
      expect(response?.status).toEqual(404)
    })

    it('parses error json if possible', async () => {
      const { result } = renderGetNonexistentOrg()

      await waitFor(() =>
        expect(result.current.error?.error).toEqual({
          errorCode: 'ObjectNotFound',
        })
      )
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
        expect(result.current.error?.error).toEqual({
          errorCode: 'ObjectNotFound',
        })
      )
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

      await waitFor(() =>
        expect(result.current.data).toMatchObject({
          name: createParams.body.name,
        })
      )
    })
  })
})
