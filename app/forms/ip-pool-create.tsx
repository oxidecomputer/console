/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import type { SetRequired } from 'type-fest'

import { api, queryClient, useApiMutation, type IpPoolCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

type IpPoolCreateForm = SetRequired<IpPoolCreate, 'poolType' | 'ipVersion'>

const defaultValues: IpPoolCreateForm = {
  name: '',
  description: '',
  ipVersion: 'v4',
  poolType: 'unicast',
}

export const handle = titleCrumb('New IP pool')

export default function CreateIpPoolSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.ipPools())

  const createPool = useApiMutation(api.systemIpPoolCreate, {
    onSuccess(_pool) {
      queryClient.invalidateEndpoint('systemIpPoolList')
      // prettier-ignore
      addToast(<>IP pool <HL>{_pool.name}</HL> created</>)
      navigate(pb.ipPools())
    },
  })

  const form = useForm<IpPoolCreateForm>({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="IP pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description, ipVersion, poolType }) => {
        createPool.mutate({ body: { name, description, ipVersion, poolType } })
      }}
      loading={createPool.isPending}
      submitError={createPool.error}
    >
      <IpPoolVisibilityMessage />
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <RadioField
        name="ipVersion"
        label="IP version"
        column
        control={form.control}
        items={[
          { value: 'v4', label: 'v4' },
          { value: 'v6', label: 'v6' },
        ]}
      />
      {/*
      // leaving this out for now because multicast is only partly supported
      // field default value is unicast, so that will go out with all creates
      <RadioField
        name="poolType"
        label="Type"
        column
        control={form.control}
        items={[
          { value: 'unicast', label: 'Unicast' },
          { value: 'multicast', label: 'Multicast' },
        ]}
      />
      */}
      <SideModalFormDocs docs={[docLinks.systemIpPools]} />
    </SideModalForm>
  )
}

export const IpPoolVisibilityMessage = () => (
  <Message
    variant="info"
    content="Users in linked silos will use IP pool names and descriptions to help them choose a pool when allocating IPs."
  />
)
