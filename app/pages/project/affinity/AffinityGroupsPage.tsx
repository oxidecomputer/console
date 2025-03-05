/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { LoaderFunctionArgs } from 'react-router'

import { apiQueryClient } from '@oxide/api'
import { Access24Icon } from '@oxide/design-system/icons/react'

import { getProjectSelector } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    apiQueryClient.prefetchQuery('projectPolicyView', { path: { project } }),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
    apiQueryClient.prefetchQuery('groupList', {}),
  ])
  return null
}

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    {/* TODO: update once Affinity icon is in the design system */}
    <PageTitle icon={<Access24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
)

export const handle = { crumb: 'Affinity' }

export default function ProjectAccessPage() {
  return (
    <>
      <AffinityPageHeader />
      Table goes here
    </>
  )
}
