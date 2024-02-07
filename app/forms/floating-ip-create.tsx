/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate, type NavigateFunction } from 'react-router-dom'

import {
  useApiMutation,
  useApiQueryClient,
  type FloatingIp,
  type FloatingIpCreate,
} from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useForm, useProjectSelector, useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: FloatingIpCreate = {
  address: '',
  description: '',
  name: '',
  pool: '',
}

type CreateSideModalFormProps = {
  /**
   * If defined, this overrides the usual mutation. Caller is responsible for
   * doing a dismiss behavior in onSubmit as well, because we are not calling
   * the RQ `onSuccess` defined for the mutation.
   */
  onSubmit?: (floatingIpCreate: FloatingIpCreate) => void
  /**
   * Passing navigate is a bit of a hack to be able to do a nav from the routes
   * file. The callers that don't need the arg can ignore it.
   */
  onDismiss?: (navigate: NavigateFunction) => void
  onSuccess?: (floatingIp: FloatingIp) => void
}

export function CreateFloatingIpSideModalForm({
  onSubmit,
  onSuccess,
}: CreateSideModalFormProps) {
  const { project } = useProjectSelector()
  console.log(project)

  // Fetch 1000 to we can be sure to get them all. There should only be a few
  // anyway. Not prefetched because the prefetched one only gets 25 to match the
  // query table. This req is better to do async because they can't click make
  // default that fast anyway.
  //   const { data: allPools } = useApiQuery('siloIpPoolList', {
  //     path: { project },
  //     query: { limit: 1000 },
  //   })
  //   console.log(allPools)

  // used in change default confirm modal
  //   const defaultPool = useMemo(
  //     () => (allPools ? allPools.items.find((p) => p.isDefault)?.name : undefined),
  //     [allPools]
  //   )

  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const createFloatingIp = useApiMutation('floatingIpCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('floatingIpList')
      addToast({ content: 'Your Floating IP has been created' })
      onSuccess?.(data)
      navigate(pb.floatingIps(projectSelector))
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-floating-ip-form"
      title="Create Floating IP"
      form={form}
      onDismiss={() => navigate(pb.floatingIps(projectSelector))}
      onSubmit={({ ...rest }) => {
        const body = { ...rest }
        onSubmit
          ? onSubmit(body)
          : createFloatingIp.mutate({ query: projectSelector, body })
      }}
      loading={createFloatingIp.isPending}
      submitError={createFloatingIp.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <p>Pool Select</p>
      <p>IP Address select</p>
    </SideModalForm>
  )
}
