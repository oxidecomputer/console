/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import type { LoaderFunctionArgs } from 'react-router'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type Policy,
} from '@oxide/api'
import { Access16Icon, Access24Icon } from '@oxide/design-system/icons/react'

import { AccessRolesTable } from '~/components/access/AccessRolesTable'
import { DocsPopover } from '~/components/DocsPopover'
import {
  ProjectAccessAddUserSideModal,
  ProjectAccessEditUserSideModal,
} from '~/forms/project-access'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { useQuickActions } from '~/hooks/use-quick-actions'
import { addToast } from '~/stores/toast'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import type * as PP from '~/util/path-params'

const policyView = q(api.policyView, {})
const projectPolicyView = ({ project }: PP.Project) =>
  q(api.projectPolicyView, { path: { project } })
const userListAll = q(api.userList, { query: { limit: ALL_ISH } })
const groupListAll = q(api.groupList, { query: { limit: ALL_ISH } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getProjectSelector(params)
  // groups must resolve before fanning out per-group member fetches
  const groups = await queryClient.fetchQuery(groupListAll)
  // Fire per-group member prefetches but don't await them: they back the user
  // details modal's group list and fill in as they resolve.
  groups.items.forEach((g) =>
    queryClient.prefetchQuery(q(api.userList, { query: { group: g.id, limit: ALL_ISH } }))
  )
  await Promise.all([
    queryClient.prefetchQuery(policyView),
    queryClient.prefetchQuery(projectPolicyView(selector)),
    queryClient.prefetchQuery(userListAll),
  ])
  return null
}

export const handle = { crumb: 'Project Access' }

export default function ProjectAccessPage() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const projectSelector = useProjectSelector()

  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(projectPolicyView(projectSelector))

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
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
        <PageTitle icon={<Access24Icon />}>Project Access</PageTitle>
        <DocsPopover
          heading="access"
          icon={<Access16Icon />}
          summary="Roles determine who can view, edit, or administer this project. Silo roles are inherited from the silo. If a user or group has both a silo and project role, the stronger role takes precedence."
          links={[docLinks.keyConceptsIam, docLinks.access, docLinks.identityProviders]}
        />
      </PageHeader>

      {addModalOpen && (
        <ProjectAccessAddUserSideModal
          onDismiss={() => setAddModalOpen(false)}
          policy={projectPolicy}
        />
      )}
      <AccessRolesTable
        siloPolicy={siloPolicy}
        projectPolicy={projectPolicy}
        EditModal={ProjectAccessEditUserSideModal}
        updateManagedPolicy={(body: Policy) =>
          updatePolicy({ path: { project: projectSelector.project }, body })
        }
        onAddClick={() => setAddModalOpen(true)}
      />
    </>
  )
}
