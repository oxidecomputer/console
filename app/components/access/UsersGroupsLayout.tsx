/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

/** Header and Users/Groups tabs shared by the silo and project pages */
export function UsersGroupsLayout({
  title,
  usersPath,
  groupsPath,
  summary,
}: {
  title: string
  usersPath: string
  groupsPath: string
  summary: string
}) {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>{title}</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary={summary}
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={usersPath}>Users</Tab>
        <Tab to={groupsPath}>Groups</Tab>
      </RouteTabs>
    </>
  )
}
