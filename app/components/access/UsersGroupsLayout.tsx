/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { Button } from '~/ui/lib/Button'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { docLinks } from '~/util/links'

import { type PolicyScope } from './policy-scope'
import { PolicyModal } from './PolicyModal'

/** Header and Users/Groups tabs shared by the silo and project pages */
export function UsersGroupsLayout({
  title,
  policyScope,
  usersPath,
  groupsPath,
  summary,
}: {
  title: string
  /** The policy this page manages, shown raw in the Show policy modal */
  policyScope: PolicyScope
  usersPath: string
  groupsPath: string
  summary: string
}) {
  const [policyOpen, setPolicyOpen] = useState(false)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Access24Icon />}>{title}</PageTitle>
        <div className="inline-flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPolicyOpen(true)}>
            Show policy
          </Button>
          <DocsPopover
            heading="access"
            icon={<Access16Icon />}
            summary={summary}
            links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
          />
        </div>
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={groupsPath}>Groups</Tab>
        <Tab to={usersPath}>Users</Tab>
      </RouteTabs>
      {policyOpen && (
        <PolicyModal policyScope={policyScope} onDismiss={() => setPolicyOpen(false)} />
      )}
    </>
  )
}
