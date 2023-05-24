import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Identicon } from '@oxide/ui'

import 'app/components/login-page.css'
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
export function SpoofLoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const loginPost = useApiMutation('loginSpoof', {
    onSuccess: () => {
      addToast({
        title: 'Logged in',
      })
      navigate(searchParams.get('state') || pb.projects())
    },
    onError: () => {
      addToast({
        title: 'Bad credentials',
        variant: 'error',
      })
    },
  })

  const logout = useApiMutation('logout', {
    onSuccess: () => {
      addToast({
        title: 'Logged out',
      })
    },
  })

  return (
    <>
      <div className="mb-3 flex items-end space-x-3">
        <Identicon
          className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
          name="maze-war"
        />
        <div className="text-sans-2xl text-default">maze-war</div>
      </div>
      <div className="text-sans-lg text-secondary">maze-war.bitmapbros.com</div>
      <hr className="my-6 w-full border-0 border-b border-b-secondary" />

      <div className="w-full space-y-3">
        <Button
          type="submit"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => loginPost.mutate({ body: { username: 'privileged' } })}
        >
          Privileged
        </Button>
        <Button
          variant="secondary"
          type="submit"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => loginPost.mutate({ body: { username: 'unprivileged' } })}
        >
          Unprivileged
        </Button>
        <Button
          variant="secondary"
          type="submit"
          className="w-full"
          disabled={loginPost.isLoading}
          onClick={() => logout.mutate({})}
        >
          Sign out
        </Button>
      </div>
    </>
  )
}
