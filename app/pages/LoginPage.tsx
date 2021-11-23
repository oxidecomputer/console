import React from 'react'

import { useMutation } from 'react-query'
import { Button } from '@oxide/ui'

export default function LoginPage() {
  const loginPost = useMutation((username: string) =>
    fetch('/login', { method: 'POST', body: JSON.stringify({ username }) })
  )
  return (
    <div className="w-full justify-center flex">
      <div className="my-48 w-96 space-y-4">
        <h3 className="text-display-xl mb-2 text-center">Log in as</h3>
        <Button
          type="submit"
          variant="solid"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => loginPost.mutate('privileged')}
        >
          Privileged
        </Button>
        <Button
          type="submit"
          variant="dim"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => loginPost.mutate('unprivileged')}
        >
          Unprivileged
        </Button>
        <Button
          type="submit"
          variant="ghost"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => loginPost.mutate('other')}
        >
          Bad Request
        </Button>
        <div className="text-red-500">{loginPost.error as any}</div>
      </div>
    </div>
  )
}
