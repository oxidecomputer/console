import { act, renderHook } from '@testing-library/react-hooks'

import { usePagination } from '../use-pagination'

describe('usePagination', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => usePagination())

    expect(result.current).toEqual({
      currentPage: undefined,
      goToNextPage: expect.any(Function),
      goToPrevPage: expect.any(Function),
      hasPrev: false,
    })
  })

  it('goToNextPage goes to next page', () => {
    const { result } = renderHook(() => usePagination())

    act(() => result.current.goToNextPage('a'))

    expect(result.current.currentPage).toEqual('a')
    expect(result.current.hasPrev).toBeTruthy()
  })

  it('landing back on first page sets hasPrev false and currentPage undefined', () => {
    const { result } = renderHook(() => usePagination())

    act(() => result.current.goToNextPage('a'))
    act(() => result.current.goToNextPage('b'))
    act(() => result.current.goToPrevPage())
    act(() => result.current.goToPrevPage())

    expect(result.current.currentPage).toBeUndefined()
    expect(result.current.hasPrev).toBeFalsy()
  })

  it('remembers previous pages', () => {
    const { result } = renderHook(() => usePagination())

    act(() => result.current.goToNextPage('a'))
    act(() => result.current.goToNextPage('b'))
    act(() => result.current.goToNextPage('c'))

    expect(result.current.currentPage).toEqual('c')

    act(() => result.current.goToPrevPage())
    expect(result.current.currentPage).toEqual('b')

    act(() => result.current.goToPrevPage())
    expect(result.current.currentPage).toEqual('a')
  })
})
