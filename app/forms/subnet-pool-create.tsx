/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, queryClient, useApiMutation, type SubnetPoolCreate } from '@oxide/api'

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

const defaultValues: SubnetPoolCreate = {
  name: '',
  description: '',
  ipVersion: 'v4',
}

export const handle = titleCrumb('New subnet pool')

export default function CreateSubnetPoolSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.subnetPools())

  const createPool = useApiMutation(api.systemSubnetPoolCreate, {
    onSuccess(_pool) {
      queryClient.invalidateEndpoint('systemSubnetPoolList')
      // prettier-ignore
      addToast(<>Subnet pool <HL>{_pool.name}</HL> created</>)
      navigate(pb.subnetPools())
    },
  })

  const form = useForm<SubnetPoolCreate>({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="subnet pool"
      onDismiss={onDismiss}
      onSubmit={({ name, description, ipVersion }) => {
        createPool.mutate({ body: { name, description, ipVersion } })
      }}
      loading={createPool.isPending}
      submitError={createPool.error}
    >
      <SubnetPoolVisibilityMessage />
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
      <SideModalFormDocs docs={[docLinks.subnetPools]} />
    </SideModalForm>
  )
}

export const SubnetPoolVisibilityMessage = () => (
  <Message
    variant="info"
    content="Users in linked silos will use subnet pool names and descriptions to help them choose a pool when allocating external subnets."
  />
)
