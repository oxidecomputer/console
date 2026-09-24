/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { AccessRolesTable } from '~/components/access/AccessRolesTable'
import { DocsPopover } from '~/components/DocsPopover'
import {
  SiloAccessAddUserSideModal,
  SiloAccessEditUserSideModal,
} from '~/forms/silo-access'
import { makeCrumb } from '~/hooks/use-crumbs'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { addToast } from '~/stores/toast'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const policyView = q(api.policyView, {})
const userList = q(api.userList, { query: { limit: ALL_ISH } })
const groupList = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader() {
  // groups must resolve before fanning out per-group member fetches
  const groups = await queryClient.fetchQuery(groupList)
  // Fire per-group member prefetches but don't await them: they back the user
  // details modal's group list and fill in as they resolve.
  groups.items.forEach((g) =>
    queryClient.prefetchQuery(q(api.userList, { query: { group: g.id, limit: ALL_ISH } }))
  )
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(userList),
  ])
  return null
}

export const handle = makeCrumb('Silo Access', pb.siloAccess())

export default function SiloAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Access removed' })
    },
  })

  useQuickActions(
    () => [
      {
        value: 'Add user or group',
        navGroup: 'Actions',
        action: () => setAddModalOpen(true),
      },
    ],
    []
  )

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

      {addModalOpen && (
        <SiloAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={siloPolicy}
        />
      )}
      <AccessRolesTable
        siloPolicy={siloPolicy}
        EditModal={SiloAccessEditUserSideModal}
        updateManagedPolicy={(body) => updatePolicy({ body })}
        onAddClick={() => setAddModalOpen(true)}
      />
    </>
  )
}
