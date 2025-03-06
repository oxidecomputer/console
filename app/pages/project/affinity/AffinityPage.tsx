/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Access24Icon } from '@oxide/design-system/icons/react'

import { RouteTabs, Tab } from '~/components/RouteTabs'
import { useProjectSelector } from '~/hooks/use-params'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { pb } from '~/util/path-builder'

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    {/* TODO: update once Affinity icon is in the design system */}
    <PageTitle icon={<Access24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
)

export const handle = { crumb: 'Affinity' }

export default function AffinityPage() {
  const project = useProjectSelector()
  return (
    <>
      <AffinityPageHeader />
      <RouteTabs fullWidth>
        <Tab to={pb.affinityGroups(project)}>Affinity Groups</Tab>
        <Tab to={pb.antiAffinityGroups(project)}>Anti-Affinity Groups</Tab>
      </RouteTabs>
    </>
  )
}
