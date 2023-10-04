/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import type { UsernamePasswordCredentials } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { Button, Identicon } from '@oxide/ui'

import { TextFieldInner } from 'app/components/form'
import 'app/components/login-page.css'
import { useForm } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { useSiloSelector, useToast } from '../hooks'

const defaultValues: UsernamePasswordCredentials = {
  username: '',
  password: '',
}

/** Username/password form for local silo login */
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
      navigate(searchParams.get('redirect_uri') || pb.projects())
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
        <Button type="submit" className="w-full" disabled={loginPost.isPending}>
          Sign in
        </Button>
        {loginPost.isError && (
          <div className="text-center text-error">Could not sign in. Please try again.</div>
        )}
      </form>
    </>
  )
}
