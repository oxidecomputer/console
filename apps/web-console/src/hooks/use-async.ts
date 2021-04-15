/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'

export function useAsync<R>(asyncFunction: () => Promise<R>) {
  const [pending, setPending] = useState(false)
  const [data, setData] = useState<R | null>(null)
  const [error, setError] = useState<any>(null)

  const execute = async () => {
    setPending(true)
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
    } catch (errorResponse) {
      const error =
        typeof errorResponse.json === 'function'
          ? await errorResponse.json()
          : errorResponse
      setError(error)
    } finally {
      setPending(false)
    }
  }

  return { execute, pending, data, error }
}
