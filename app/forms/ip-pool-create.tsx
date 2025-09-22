/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useApiMutation, useApiQueryClient, type IpPoolCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { pb } from '~/util/path-builder'

// We are leaving the v4/v6 radio out for now because while you can
// create a v6 pool, you can't actually add any ranges to it until
// https://github.com/oxidecomputer/omicron/issues/8966

const defaultValues: IpPoolCreate = {
  name: '',
  description: '',
  ipVersion: 'v4',
}

export const handle = titleCrumb('New IP pool')

export default function CreateIpPoolSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.ipPools())

  const createPool = useApiMutation('ipPoolCreate', {
    onSuccess(_pool) {
      queryClient.invalidateQueries('ipPoolList')
      addToast(<>IP pool <HL>{_pool.name}</HL> created</>) // prettier-ignore
      navigate(pb.ipPools())
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createPool.mutate({ body: { name, description } })
      }}
      loading={createPool.isPending}
      submitError={createPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <IpPoolVisibilityMessage />
    </SideModalForm>
  )
}

export const IpPoolVisibilityMessage = () => (
  <Message
    variant="info"
    content="Users in linked silos will use IP pool names and descriptions to help them choose a pool when allocating IPs."
  />
)
