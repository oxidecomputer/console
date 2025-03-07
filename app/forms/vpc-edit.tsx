/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getVpcSelector, useVpcSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

export const handle = titleCrumb('Edit VPC')

const vpcView = ({ project, vpc }: PP.Vpc) =>
  apiq('vpcView', { path: { vpc }, query: { project } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, vpc } = getVpcSelector(params)
  await queryClient.prefetchQuery(vpcView({ project, vpc }))
  return null
}

export default function EditVpcSideModalForm() {
  const { vpc: vpcName, project } = useVpcSelector()
  const navigate = useNavigate()

  const { data: vpc } = usePrefetchedQuery(vpcView({ project, vpc: vpcName }))

  const editVpc = useApiMutation('vpcUpdate', {
    onSuccess(updatedVpc) {
      queryClient.invalidateEndpoint('vpcList')
      navigate(pb.vpc({ project, vpc: updatedVpc.name }))
      addToast(<>VPC <HL>{updatedVpc.name}</HL> updated</>) // prettier-ignore

      // Only invalidate if we're staying on the same page. If the name
      // _has_ changed, invalidating vpcView causes an error page to flash
      // while the loader for the target page is running because the current
      // page's VPC gets cleared out while we're still on the page. If we're
      // navigating to a different page, its query will fetch anew regardless.
      if (vpc.name === updatedVpc.name) {
        queryClient.invalidateEndpoint('vpcView')
      }
    },
  })

  const form = useForm({ defaultValues: vpc })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="VPC"
      onDismiss={() => navigate(pb.vpc({ project, vpc: vpcName }))}
      onSubmit={({ name, description, dnsName }) => {
        editVpc.mutate({
          path: { vpc: vpcName },
          query: { project },
          body: { name, description, dnsName },
        })
      }}
      loading={editVpc.isPending}
      submitError={editVpc.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <NameField name="dnsName" label="DNS name" required={false} control={form.control} />
    </SideModalForm>
  )
}
