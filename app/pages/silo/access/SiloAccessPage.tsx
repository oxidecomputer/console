/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { api, q, queryClient } from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const policyView = q(api.policyView, {})
const userList = q(api.userList, {})
const groupList = q(api.groupList, {})

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    // used to resolve user names
    queryClient.prefetchQuery(userList),
    queryClient.prefetchQuery(groupList),
  ])
  return null
}

export const handle = { crumb: 'Silo Access' }

export default function SiloAccessPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Silo Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this silo and the projects within it. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access]}
        />
      </PageHeader>

      <RouteTabs fullWidth>
        <Tab to={pb.siloAccessAll()}>All</Tab>
        <Tab to={pb.siloAccessUsers()}>Users</Tab>
        <Tab to={pb.siloAccessGroups()}>Groups</Tab>
      </RouteTabs>
      {/* TODO: Add routes for side modal forms to enable deep linking and browser back button:
          - /access/all/users-new and /access/all/groups-new for adding
          - /access/all/{id}/edit for editing roles
          This would align with patterns like /instances-new, /idps-new, etc. */}
    </>
  )
}
