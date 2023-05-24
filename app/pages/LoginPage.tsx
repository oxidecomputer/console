import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { UsernamePasswordCredentials } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { Button, Identicon } from '@oxide/ui'

import { TextFieldInner } from 'app/components/form'
import 'app/components/login-page.css'
import { pb } from 'app/util/path-builder'

import { useSiloSelector, useToast } from '../hooks'

const defaultValues: UsernamePasswordCredentials = {
  username: '',
  password: '',
}

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
export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const { silo } = useSiloSelector()

  const form = useForm({ defaultValues })

  const loginPost = useApiMutation('loginLocal')

  useEffect(() => {
    if (loginPost.isSuccess) {
      addToast({ title: 'Logged in' })
      navigate(searchParams.get('state') || pb.projects())
    }
  }, [loginPost.isSuccess, navigate, searchParams, addToast])

  return (
    <>
      <div className="mb-3 flex items-end space-x-3">
        <Identicon
          className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
          name={silo}
        />
        <div className="text-sans-2xl text-default">{silo}</div>
      </div>

      <hr className="my-6 w-full border-0 border-b border-b-secondary" />

      <form
        className="w-full space-y-4"
        onSubmit={form.handleSubmit((body) => {
          loginPost.mutate({ body, path: { siloName: silo } })
        })}
      >
        <div>
          <TextFieldInner
            name="username"
            placeholder="Username"
            autoComplete="username"
            required
            control={form.control}
          />
        </div>
        <div>
          <TextFieldInner
            name="password"
            type="password"
            placeholder="Password"
            required
            control={form.control}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loginPost.isLoading}>
          Sign in
        </Button>
        {loginPost.isError && (
          <div className="text-center text-error">Could not sign in. Please try again.</div>
        )}
      </form>
    </>
  )
}
