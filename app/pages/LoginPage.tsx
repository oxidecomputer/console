import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Success16Icon, Warning12Icon } from '@oxide/ui'

import { pb } from 'app/util/path-builder'

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
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const loginPost = useApiMutation('loginSpoof', {
    onSuccess: () => {
      addToast({
        title: 'Logged in',
        icon: <Success16Icon />,
      })
      navigate(searchParams.get('state') || pb.orgs())
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
    <div className="space-y-4 bg-default">
      <h3 className="mb-2 text-center text-sans-2xl">Log in as</h3>
      <Button
        type="submit"
        className="w-full"
        disabled={loginPost.isLoading}
        onClick={() => loginPost.mutate({ body: { username: 'privileged' } })}
      >
        Privileged
      </Button>
      <Button
        type="submit"
        className="w-full"
        disabled={loginPost.isLoading}
        onClick={() => loginPost.mutate({ body: { username: 'unprivileged' } })}
      >
        Unprivileged
      </Button>
      <Button
        type="submit"
        variant="danger"
        className="w-full"
        disabled={loginPost.isLoading}
        onClick={() => loginPost.mutate({ body: { username: 'other' } })}
      >
        Bad Request
      </Button>
      <Button
        type="submit"
        variant="ghost"
        className="w-full"
        disabled={loginPost.isLoading}
        onClick={() => logout.mutate({})}
      >
        Log out
      </Button>
    </div>
  )
}
