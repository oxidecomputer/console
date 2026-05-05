/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type Policy,
} from '@oxide/api'

import { AccessUsersTab } from '~/components/access/AccessUsersTab'
import { ProjectAccessEditUserSideModal } from '~/forms/project-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'

const policyView = q(api.policyView, {})

export const handle = titleCrumb('Users')

export default function ProjectAccessUsersTab() {
  const { project } = useProjectSelector()
  const { data: siloPolicy } = usePrefetchedQuery(policyView)
  const { data: projectPolicy } = usePrefetchedQuery(
    q(api.projectPolicyView, { path: { project } })
  )

  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Role removed' })
    },
  })

  return (
    <AccessUsersTab
      scopedPolicies={[
        { scope: 'silo', policy: siloPolicy },
        { scope: 'project', policy: projectPolicy },
      ]}
      managedScope="project"
      EditModal={ProjectAccessEditUserSideModal}
      updateManagedPolicy={(body: Policy) => updatePolicy({ path: { project }, body })}
    />
  )
}
