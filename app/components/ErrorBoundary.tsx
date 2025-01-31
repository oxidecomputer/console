/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary as BaseErrorBoundary } from 'react-error-boundary'
import { useRouteError } from 'react-router'

import { apiq } from '~/api'
import { type ApiError } from '~/api/errors'
import { Message } from '~/ui/lib/Message'

import { ErrorPage, NotFound } from './ErrorPage'

const IdpMisconfig = () => (
  <Message
    variant="notice"
    className="!mt-6"
    showIcon={false}
    content={
      <>
        You are not in any user groups and you have no assigned role on the silo. This
        usually means the{' '}
        <a
          href="https://docs.oxide.computer/guides/system/completing-rack-config#_test_user_login"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          admin group name
        </a>{' '}
        is not set correctly for the silo.
      </>
    }
  />
)

function useDetectNoSiloRole(enabled: boolean): boolean {
  // this is kind of a hail mary, so if any of this goes wrong we need to ignore it
  const options = { enabled, throwOnError: false }
  const { data: me } = useQuery(apiq('currentUserView', {}, options))
  const { data: myGroups } = useQuery(apiq('currentUserGroups', {}, options))
  const { data: siloPolicy } = useQuery(apiq('policyView', {}, options))

  if (!me || !myGroups || !siloPolicy) return false

  const noGroups = myGroups.items.length === 0
  const hasDirectRoleOnSilo = siloPolicy.roleAssignments.some((r) => r.identityId === me.id)
  return noGroups && !hasDirectRoleOnSilo
}

export const trigger404 = { type: 'error', statusCode: 404 }

type Props = { error: Error | ApiError }

function ErrorFallback({ error }: Props) {
  console.error(error)
  const statusCode = 'statusCode' in error ? error.statusCode : undefined

  // if the error is a 403, make API calls to check whether the user has any
  // groups or any roles directly on the silo
  const showIdpMisconfig = useDetectNoSiloRole(statusCode === 403)

  if (statusCode === 404) return <NotFound />

  return (
    <ErrorPage>
      <h1 className="text-sans-2xl">Something went wrong</h1>
      <p className="text-secondary">
        Please try again. If the problem persists, contact your administrator.
      </p>
      {showIdpMisconfig && <IdpMisconfig />}
    </ErrorPage>
  )
}

export const ErrorBoundary = (props: { children: React.ReactNode }) => (
  <BaseErrorBoundary FallbackComponent={ErrorFallback}>{props.children}</BaseErrorBoundary>
)

export function RouterDataErrorBoundary() {
  // TODO: validate this unknown at runtime _before_ passing to ErrorFallback
  const error = useRouteError() as Props['error']
  return <ErrorFallback error={error} />
}
