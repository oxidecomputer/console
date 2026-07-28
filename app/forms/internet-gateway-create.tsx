/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, queryClient, useApiMutation, type InternetGatewayCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useVpcSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const defaultValues: InternetGatewayCreate = {
  name: '',
  description: '',
}

export const handle = titleCrumb('New Internet Gateway')

export default function InternetGatewayCreateForm() {
  const vpcSelector = useVpcSelector()
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.vpcInternetGateways(vpcSelector))

  const createGateway = useApiMutation(api.internetGatewayCreate, {
    onSuccess(gateway) {
      queryClient.invalidateEndpoint('internetGatewayList')
      // prettier-ignore
      addToast(<>Internet gateway <HL>{gateway.name}</HL> created</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="internet gateway"
      onDismiss={onDismiss}
      onSubmit={(body) => createGateway.mutate({ query: vpcSelector, body })}
      loading={createGateway.isPending}
      submitError={createGateway.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <SideModalFormDocs docs={[docLinks.gateways]} />
    </SideModalForm>
  )
}
