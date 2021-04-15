import { useState } from 'react'

// TODO: this is what the API currently response with for 400s, but it may not
// cover all API errors, and it definitely doesn't cover places where we might
// use useAsync for something other than a POST to our own API
interface ResponseError {
  request_id: string
  message: string
  error_code: number | null
}

interface AsyncResult<R> {
  execute: () => Promise<void>
  pending: boolean
  data: R | null
  error: ResponseError | null
}

export function useAsync<R>(asyncFunction: () => Promise<R>): AsyncResult<R> {
  const [pending, setPending] = useState(false)
  const [data, setData] = useState<R | null>(null)
  const [error, setError] = useState<ResponseError | null>(null)

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
