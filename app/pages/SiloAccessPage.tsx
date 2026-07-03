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
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

// Parent prefetches everything both tabs need so switching between Users and
// Groups doesn't trigger a fetch. This loader runs once on entry to /access;
// react-router won't re-run it when navigating between sibling tab routes.
// Both tabs fetch the full user/group lists so they can be sorted by name
// client-side (the API only sorts by id).
const policyView = q(api.policyView, {})
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  // groups must resolve before fanning out per-group member fetches
  const groups = await queryClient.fetchQuery(groupListAll)
  // Fire per-group member prefetches but don't await them: the tabs read these
  // via useQuery/useQueries (not usePrefetchedQuery), so member counts and the
  // per-user group lists fill in as they resolve instead of blocking the page
  // on one request per group.
  groups.items.forEach((g) =>
    queryClient.prefetchQuery(q(api.userList, { query: { group: g.id, limit: ALL_ISH } }))
  )
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(userListAll),
  ])
  return null
}

export const handle = makeCrumb('Silo Access', pb.siloAccess())

export default function SiloAccessPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>Silo Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this silo and the projects within it. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={pb.siloAccessGroups()}>Groups</Tab>
        <Tab to={pb.siloAccessUsers()}>Users</Tab>
      </RouteTabs>
    </>
  )
}
