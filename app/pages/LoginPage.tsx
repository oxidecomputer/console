import React from 'react'
import { useNavigate } from 'react-router'

import { useApiMutation } from '@oxide/api'
import { Button, Warning12Icon, Success16Icon } from '@oxide/ui'
import { useToast } from '../hooks'

/**
 * Placeholder login page for demo purposes.
 *
 * The demo login form is only in the console bundle for the convenience of
 * using existing tooling and using the generated API client. In the real rack,
 * login will go through the customer's IdP; no form controlled by us will be
 * involved. If Nexus *does* end up serving a login form, e.g., for use by
 * admins before the IdP is set up, that will be a separate bundle with minimal
 * JS (ideally so minimal we could inline it in the HTML response) and it would
 * not use the generated API client at all. It could even use an HTML form POST.
 *
 * Login and logout endpoints are only a temporary addition to the OpenAPI spec.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const addToast = useToast()
  // TODO these are not under organizations. annoying. should really just use plain react-query
  const loginPost = useApiMutation('spoofLogin', {
    onSuccess: () => {
      addToast({
        title: 'Logged in',
        icon: <Success16Icon />,
        timeout: 4000,
      })
      navigate('/')
    },
    onError: () => {
      addToast({
        title: 'Bad credentials',
        icon: <Warning12Icon />,
        variant: 'error',
        timeout: 4000,
      })
    },
  })

  const logout = useApiMutation('logout', {
    onSuccess: () => {
      addToast({
        title: 'Logged out',
        icon: <Success16Icon />,
        timeout: 4000,
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
