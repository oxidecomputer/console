/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { apiQueryClient } from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export async function clientLoader() {
  await Promise.all([
    apiQueryClient.prefetchQuery('policyView', {}),
    // used to resolve user names
    apiQueryClient.prefetchQuery('userList', {}),
    apiQueryClient.prefetchQuery('groupList', {}),
  ])
  return null
}

export const handle = makeCrumb('Silo Access', pb.siloAccessPolicy())

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
        <Tab to={pb.siloAccessPolicy()}>Policy</Tab>
        <Tab to={pb.siloAccessSettings()}>Settings</Tab>
      </RouteTabs>
    </>
  )
}
