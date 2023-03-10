import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Identicon, Success16Icon, Warning12Icon } from '@oxide/ui'

import heroRackImg from 'app/assets/oxide-hero-rack.webp'
import 'app/components/login-page.css'
import { Logo } from 'app/layouts/AuthLayout'
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
    <main className="layout relative flex h-screen">
      <div className="hero-bg relative flex w-1/2 justify-end text-accent sm-:hidden">
        <div className="hero-rack-wrapper">
          <img src={heroRackImg} alt="A populated Oxide rack" className="hero-rack" />
        </div>
      </div>
      <div className="z-10 flex h-full w-1/2 justify-start sm-:w-full sm-:justify-center">
        <div className="flex h-full w-full max-w-[480px] items-center justify-center sm+:pr-10">
          <div className="flex w-[320px] flex-col items-center">
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
              <Button type="submit" className="w-full">
                Sign in with SSO
              </Button>
              {/* <Button variant="secondary" type="submit" className="w-full">
              Continue with email
            </Button> */}
            </div>

            {/* todo: we might want to collect an operator email
                and insert it in here as a mailto
            <div className="mt-6 text-sans-sm text-quaternary">
              Don&apos;t have an account
              <a href="/" className="ml-1 underline text-tertiary">
                Request access
              </a>
            </div>
            */}
          </div>
        </div>
      </div>
      <Logo className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm-:block" />
    </main>
  )

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
