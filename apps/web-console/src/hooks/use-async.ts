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
    } catch (error) {
      const body = await error.json()
      setError(body)
    } finally {
      setPending(false)
    }
  }

  return { execute, pending, data, error }
}
