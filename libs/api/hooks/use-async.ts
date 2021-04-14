import { useState } from 'react'

export function useAsync<R>(asyncFunction: () => Promise<R>) {
  const [isPending, setIsPending] = useState(false)
  const [value, setValue] = useState<R | null>(null)
  const [error, setError] = useState(null)

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = () => {
    setIsPending(true)
    setValue(null)
    setError(null)

    return asyncFunction()
      .then((response) => {
        setValue(response)
      })
      .catch(async (error: Response) => {
        const body = await error.json()
        setError(body)
      })
      .finally(() => {
        setIsPending(false)
      })
  }

  return { execute, isPending, value, error }
}
