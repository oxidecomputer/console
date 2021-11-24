import React from 'react'
import { useNavigate } from 'react-router'

import { useApiMutation } from '@oxide/api'
import { Button, Warning12Icon, Success16Icon } from '@oxide/ui'
import { useToast } from '../hooks'

export default function LoginPage() {
  // TODO: this doesn't work when running locally with vite because the vite dev
  // server expects api routes to have the prefix /api. getting this endpoint
  // into the OpenAPI spec and using the generated client here would fix this
  const navigate = useNavigate()
  const addToast = useToast()
  const loginPost = useApiMutation('spoofLogin', {
    onSuccess: () => {
      addToast({
        title: 'Logged in',
        icon: <Success16Icon />,
      })
      navigate('/')
    },
    onError: () => {
      addToast({
        title: 'Bad credentials',
        icon: <Warning12Icon />,
        variant: 'error',
      })
    },
  })

  const logout = useApiMutation('logout', {
    onSuccess: () => {
      addToast({
        title: 'Logged out',
        icon: <Success16Icon />,
      })
    },
  })
  return (
    <div className="w-full justify-center flex">
      <div className="my-48 w-96 space-y-4">
        <h3 className="text-display-xl mb-2 text-center">Log in as</h3>
        <Button
          type="submit"
          variant="solid"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() =>
            loginPost.mutate({ loginParams: { username: 'privileged' } })
          }
        >
          Privileged
        </Button>
        <Button
          type="submit"
          variant="dim"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() =>
            loginPost.mutate({ loginParams: { username: 'unprivileged' } })
          }
        >
          Unprivileged
        </Button>
        <Button
          type="submit"
          variant="ghost"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() =>
            loginPost.mutate({ loginParams: { username: 'other' } })
          }
        >
          Bad Request
        </Button>
        <Button
          type="submit"
          variant="link"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => logout.mutate({})}
        >
          Log out
        </Button>
      </div>
    </div>
  )
}
