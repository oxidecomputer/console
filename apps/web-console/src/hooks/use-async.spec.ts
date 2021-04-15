import { renderHook, act } from '@testing-library/react-hooks'
import { useAsync } from './use-async'

describe('useAsync', () => {
  it('starts with null data, null error, and pending false', () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve(1)))

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.pending).toBe(false)
  })

  it('with promise in flight, has pending true, null error, and null data', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsync(() => Promise.resolve(1))
    )
    act(() => {
      result.current.execute()
    })

    expect(result.current.pending).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    await waitForNextUpdate()
  })

  it('after promise resolves, has data, null error, and pending false', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsync(() => Promise.resolve(1))
    )
    act(() => {
      result.current.execute()
    })
    await waitForNextUpdate()

    expect(result.current.data).toBe(1)
    expect(result.current.error).toBeNull()
    expect(result.current.pending).toBe(false)
  })

  it('after promise rejects, has error, null data, and pending false', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAsync(() => Promise.reject(1))
    )
    act(() => {
      result.current.execute()
    })
    await waitForNextUpdate()

    expect(result.current.error).toBe(1)
    expect(result.current.data).toBeNull()
    expect(result.current.pending).toBe(false)
  })
})
