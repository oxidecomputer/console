/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type Policy,
  type ScopedPolicy,
} from '@oxide/api'

import { AccessUsersTab } from '~/components/access/AccessUsersTab'
import { SiloAccessEditUserSideModal } from '~/forms/silo-access'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'

const policyView = q(api.policyView, {})

export const handle = titleCrumb('Users')

export default function SiloUsersTab() {
  const { data: siloPolicy } = usePrefetchedQuery(policyView)

  const scopedPolicies = useMemo(
    () => [{ scope: 'silo', policy: siloPolicy }] satisfies ScopedPolicy[],
    [siloPolicy]
  )

  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Role removed' })
    },
  })

  return (
    <AccessUsersTab
      scopedPolicies={scopedPolicies}
      managedScope="silo"
      EditModal={SiloAccessEditUserSideModal}
      updateManagedPolicy={(body: Policy) => updatePolicy({ body })}
    />
  )
}
