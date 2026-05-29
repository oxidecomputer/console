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
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'

const policyView = q(api.policyView, {})

export const handle = titleCrumb('Users')

export default function SiloAccessUsersTab() {
  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Role removed' })
    },
  })

  return (
    <AccessUsersTab
      scopedPolicies={[{ scope: 'silo', policy: siloPolicy }]}
      managedScope="silo"
      EditModal={SiloAccessEditUserSideModal}
      updateManagedPolicy={(body: Policy) => updatePolicy({ body })}
    />
  )
}
