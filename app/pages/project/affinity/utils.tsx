/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Affinity24Icon } from '@oxide/design-system/icons/react'

import {
  apiq,
  type AffinityGroup,
  type AffinityGroupMember,
  type AntiAffinityGroup,
  type AntiAffinityGroupMember,
} from '~/api'
import { useProjectSelector } from '~/hooks/use-params'
import { Badge } from '~/ui/lib/Badge'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const affinityGroupView = ({ project, affinityGroup }: PP.AffinityGroup) =>
  apiq('affinityGroupView', { path: { affinityGroup }, query: { project } })
export const affinityGroupMemberList = ({ project, affinityGroup }: PP.AffinityGroup) =>
  apiq('affinityGroupMemberList', { path: { affinityGroup }, query: { project } })
export const antiAffinityGroupView = ({
  project,
  antiAffinityGroup,
}: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupView', { path: { antiAffinityGroup }, query: { project } })
export const antiAffinityGroupMemberList = ({
  project,
  antiAffinityGroup,
}: PP.AntiAffinityGroup) =>
  apiq('antiAffinityGroupMemberList', { path: { antiAffinityGroup }, query: { project } })

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    {/* TODO: update once Affinity icon is in the design system */}
    <PageTitle icon={<Affinity24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
)

type AffinityGroupType = {
  type: 'affinity'
  group: AffinityGroup
  members: AffinityGroupMember[]
}
type AntiAffinityGroupType = {
  type: 'anti-affinity'
  group: AntiAffinityGroup
  members: AntiAffinityGroupMember[]
}
type GroupPageType = AffinityGroupType | AntiAffinityGroupType

export const GroupPage = ({ type, group, members }: GroupPageType) => {
  const { id, name, description, policy, timeCreated } = group
  return (
    <>
      <AffinityPageHeader name={name} />
      <PropertiesTable columns={2} className="-mt-8 mb-8">
        <PropertiesTable.Row label="type">
          <Badge>{type}</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DescriptionRow description={description} />
        <PropertiesTable.Row label="policy">
          <Badge color="neutral">{policy}</Badge>
        </PropertiesTable.Row>
        <PropertiesTable.DateRow date={timeCreated} label="Created" />
        <PropertiesTable.Row label="Members">{members.length}</PropertiesTable.Row>
        <PropertiesTable.IdRow id={id} />
      </PropertiesTable>
      Members Table Goes Here
    </>
  )
}

// For both Affinity Groups and Anti-Affinity Groups
export const AffinityGroupEmptyState = ({
  type,
}: {
  type: 'affinity' | 'anti-affinity'
}) => {
  const project = useProjectSelector()
  const buttonTo =
    type === 'affinity' ? pb.affinityGroupNew(project) : pb.antiAffinityGroupNew(project)
  return (
    <EmptyMessage
      icon={<Affinity24Icon />}
      title={`No ${type} groups`}
      body={`Create a new ${type} group to see it here`}
      buttonText={`New ${type} group`}
      buttonTo={buttonTo}
    />
  )
}
