/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { api, queryClient, useApiMutation, type VpcRouterCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useVpcSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FormDivider } from '~/ui/lib/Divider'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const defaultValues: VpcRouterCreate = {
  name: '',
  description: '',
}

export const handle = titleCrumb('New Router')

export default function RouterCreate() {
  const vpcSelector = useVpcSelector()
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.vpcRouters(vpcSelector))

  const createRouter = useApiMutation(api.vpcRouterCreate, {
    onSuccess(router) {
      queryClient.invalidateEndpoint('vpcRouterList')
      // prettier-ignore
      addToast(<>Router <HL>{router.name}</HL> created</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="router"
      onDismiss={onDismiss}
      onSubmit={(body) => createRouter.mutate({ query: vpcSelector, body })}
      loading={createRouter.isPending}
      submitError={createRouter.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      <SideModalFormDocs docs={[docLinks.routers]} />
    </SideModalForm>
  )
}
