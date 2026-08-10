/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import {
  api,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type InternetGatewayIpAddressCreate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { noPasswordManager, TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getInternetGatewaySelector, useInternetGatewaySelector } from '~/hooks/use-params'
import { gatewayIpAddressList } from '~/pages/project/vpcs/gateway-data'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { validateIp } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = titleCrumb('Attach IP Address')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getInternetGatewaySelector(params)
  await queryClient.prefetchQuery(gatewayIpAddressList(selector).optionsFn())
  return null
}

const defaultValues: InternetGatewayIpAddressCreate = {
  name: '',
  description: '',
  address: '',
}

const alreadyAttachedMessage =
  'Internet gateways can have at most one IP address attached. Detach the existing address before attaching another.'

export default function InternetGatewayIpAddressCreateForm() {
  const { project, vpc, gateway } = useInternetGatewaySelector()
  const navigate = useNavigate()

  const { data: addresses } = usePrefetchedQuery(
    gatewayIpAddressList({ project, vpc, gateway }).optionsFn()
  )
  // gateways can have at most one IP address attached: the unique index is on
  // internet_gateway_id alone
  // https://github.com/oxidecomputer/omicron/blob/99249b4/schema/crdb/dbinit.sql#L2314-L2317
  const alreadyAttached = addresses.items.length > 0

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
      submitDisabled={alreadyAttached ? alreadyAttachedMessage : undefined}
    >
      {alreadyAttached && <Message variant="info" content={alreadyAttachedMessage} />}
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
