/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'

import { usePagination } from './use-pagination'

describe('usePagination', () => {
  it('starts with empty state', async () => {
    const { result } = await renderHook(() => usePagination())

    expect(result.current).toEqual({
      currentPage: undefined,
      goToNextPage: expect.any(Function),
      goToPrevPage: expect.any(Function),
      hasPrev: false,
    })
  })

  it('goToNextPage goes to next page', async () => {
    const { result, act } = await renderHook(() => usePagination())

    await act(() => result.current.goToNextPage('a'))

    expect(result.current.currentPage).toEqual('a')
    expect(result.current.hasPrev).toBeTruthy()
  })

  it('landing back on first page sets hasPrev false and currentPage undefined', async () => {
    const { result, act } = await renderHook(() => usePagination())

    await act(() => result.current.goToNextPage('a'))
    await act(() => result.current.goToNextPage('b'))
    await act(() => result.current.goToPrevPage())
    await act(() => result.current.goToPrevPage())

    expect(result.current.currentPage).toBeUndefined()
    expect(result.current.hasPrev).toBeFalsy()
  })

  it('resets to the first page when the query changes', async () => {
    const { result, rerender, act } = await renderHook(
      (props) => usePagination(props?.queryId),
      { initialProps: { queryId: 'a' } }
    )

    await act(() => result.current.goToNextPage('page2'))
    expect(result.current.currentPage).toEqual('page2')
    expect(result.current.hasPrev).toBeTruthy()

    await rerender({ queryId: 'b' })

    expect(result.current.currentPage).toBeUndefined()
    expect(result.current.hasPrev).toBeFalsy()
  })

  it('remembers previous pages', async () => {
    const { result, act } = await renderHook(() => usePagination())

    await act(() => result.current.goToNextPage('a'))
    await act(() => result.current.goToNextPage('b'))
    await act(() => result.current.goToNextPage('c'))

    expect(result.current.currentPage).toEqual('c')

    await act(() => result.current.goToPrevPage())
    expect(result.current.currentPage).toEqual('b')

    await act(() => result.current.goToPrevPage())
    expect(result.current.currentPage).toEqual('a')
  })
})
