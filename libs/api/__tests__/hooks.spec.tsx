import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'
import fetchMock from 'fetch-mock'
import { Response } from 'node-fetch'

import { project, projects } from '@oxide/api-mocks'
import { useApiQuery, useApiMutation } from '../'

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

const renderGetProjects = () =>
  renderHook(() => useApiQuery('projectsGet', {}), wrapper())

const renderCreateProject = () =>
  renderHook(() => useApiMutation('projectsPost', {}), wrapper())

const createParams = {
  projectCreateParams: { name: 'abc', description: '' },
}

afterEach(() => {
  fetchMock.reset()
})

describe('useApiQuery', () => {
  it('has correct initial state', () => {
    const { result } = renderGetProjects()

    // we're not really trying to test library function useQuery here, but
    // we do want to make sure it's hooked up correctly
    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeTruthy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const response = new Response('Not found', { status: 404 })
      fetchMock.get('/api/projects', response)

      const { result } = renderGetProjects()

      await waitFor(() => expect(result.current.error?.raw).toEqual(response))
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      const response = new Response(JSON.stringify(error), { status: 404 })
      fetchMock.get('/api/projects', response)

      const { result } = renderGetProjects()

      await waitFor(() => expect(result.current.error?.data).toEqual(error))
    })

    it('sets error.data to null if error body is not json', async () => {
      const response = new Response('not json', { status: 404 })
      fetchMock.get('/api/projects', response)

      const { result } = renderGetProjects()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const response = new Response(JSON.stringify(projects), { status: 200 })
      fetchMock.get('/api/projects', response)

      const { result } = renderGetProjects()

      await waitFor(() => expect(result.current.data).toEqual(projects))
    })
  })
})

describe('useApiMutation', () => {
  it('has correct initial state', () => {
    const { result } = renderCreateProject()

    expect(result.current.data).toBeFalsy()
    expect(result.current.error).toBeFalsy()
    expect(result.current.isLoading).toBeFalsy()
  })

  describe('on error response', () => {
    it('passes through raw response', async () => {
      const response = new Response('Bad request', { status: 400 })
      fetchMock.post('/api/projects', response)

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error?.raw).toEqual(response))
    })

    it('parses error json if possible', async () => {
      const error = { abc: 'xyz' }
      const response = new Response(JSON.stringify(error), { status: 400 })
      fetchMock.post('/api/projects', response)

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.error?.data).toEqual(error))
    })

    it('sets error.data to null if error body is not json', async () => {
      const response = new Response('not json', { status: 404 })
      fetchMock.post('/api/projects', response)

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(result.current.error?.data).toBeNull()
      })
    })
  })

  describe('on success response', () => {
    it('returns data', async () => {
      const response = new Response(JSON.stringify(project), { status: 201 })
      fetchMock.post('/api/projects', response)

      const { result } = renderCreateProject()
      act(() => result.current.mutate(createParams))

      await waitFor(() => expect(result.current.data).toEqual(project))
    })
  })
})
