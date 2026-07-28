/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  queryClient,
  useApiMutation,
  type InternetGatewayIpAddressCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { noPasswordManager, TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useInternetGatewaySelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { validateIp } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = titleCrumb('Attach IP Address')

const defaultValues: InternetGatewayIpAddressCreate = {
  name: '',
  description: '',
  address: '',
}

export default function InternetGatewayIpAddressCreateForm() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.vpcInternetGateway({ project, vpc, gateway }))

  const attachAddress = useApiMutation(api.internetGatewayIpAddressCreate, {
    onSuccess(address) {
      queryClient.invalidateEndpoint('internetGatewayIpAddressList')
      // prettier-ignore
      addToast(<>IP address <HL>{address.name}</HL> attached</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="IP address"
      title="Attach IP address"
      onDismiss={onDismiss}
      onSubmit={(body) => attachAddress.mutate({ query: { project, vpc, gateway }, body })}
      loading={attachAddress.isPending}
      submitError={attachAddress.error}
    >
      <NameField
        name="name"
        control={form.control}
        description="A name for this attachment"
      />
      <DescriptionField name="description" control={form.control} />
      <TextField
        name="address"
        label="IP address"
        description="An address from an IP pool attached to this gateway"
        control={form.control}
        required
        validate={validateIp}
        {...noPasswordManager}
      />
      <SideModalFormDocs docs={[docLinks.gateways]} />
    </SideModalForm>
  )
}
