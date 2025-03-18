/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Affinity24Icon } from '@oxide/design-system/icons/react'

import { useProjectSelector } from '~/hooks/use-params'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { pb } from '~/util/path-builder'

export const AffinityPageHeader = ({ name = 'Affinity' }: { name?: string }) => (
  <PageHeader>
    <PageTitle icon={<Affinity24Icon />}>{name}</PageTitle>
    {/* TODO: Add a DocsPopover with docLinks.affinity once the doc page exists */}
  </PageHeader>
)

export const AffinityGroupEmptyState = () => (
  <EmptyMessage
    icon={<Affinity24Icon />}
    title="No anti-affinity groups"
    body="Create a new anti-affinity group to see it here"
    buttonText="New anti-affinity group"
    buttonTo={pb.antiAffinityGroupNew(useProjectSelector())}
  />
)
