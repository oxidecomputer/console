/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router'

import { queryClient } from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { accessQueries } from '~/api/access-queries'
import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(accessQueries.siloPolicy()),
    queryClient.prefetchQuery(accessQueries.projectPolicy(selector)),
    // used to resolve user names
    queryClient.prefetchQuery(accessQueries.userList()),
    queryClient.prefetchQuery(accessQueries.groupList()),
  ])
  return null
}

export const handle = { crumb: 'Project Access' }

export default function ProjectAccessPage() {
  const projectSelector = useProjectSelector()

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Project Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this project. Silo roles are inherited from the silo. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access]}
        />
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.projectAccessAll(projectSelector)}>All</Tab>
        <Tab to={pb.projectAccessUsers(projectSelector)}>Users</Tab>
        <Tab to={pb.projectAccessGroups(projectSelector)}>Groups</Tab>
      </RouteTabs>
      {/* TODO: Add routes for side modal forms to enable deep linking and browser back button:
          - /access/all/users-new and /access/all/groups-new for adding
          - /access/all/{id}/edit for editing roles
          This would align with patterns like /instances-new, /idps-new, etc. */}
    </>
  )
}
