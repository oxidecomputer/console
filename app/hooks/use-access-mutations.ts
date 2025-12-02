/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { api, queryClient, useApiMutation } from '@oxide/api'

import { addToast } from '~/stores/toast'

export function useProjectAccessMutations() {
  const { mutateAsync: updatePolicy } = useApiMutation(api.projectPolicyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('projectPolicyView')
      addToast({ content: 'Access removed' })
    },
  })

  return { updatePolicy }
}

export function useSiloAccessMutations() {
  const { mutateAsync: updatePolicy } = useApiMutation(api.policyUpdate, {
    onSuccess: () => {
      queryClient.invalidateEndpoint('policyView')
      addToast({ content: 'Access removed' })
    },
  })

  return { updatePolicy }
}
