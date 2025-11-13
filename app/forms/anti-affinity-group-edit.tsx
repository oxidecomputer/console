/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'
import * as R from 'remeda'

import {
  api,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type AntiAffinityGroupUpdate,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import {
  getAntiAffinityGroupSelector,
  useAntiAffinityGroupSelector,
} from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

import { antiAffinityGroupView } from './affinity-util'

export const handle = titleCrumb('New anti-affinity group')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, antiAffinityGroup } = getAntiAffinityGroupSelector(params)
  await queryClient.prefetchQuery(antiAffinityGroupView({ project, antiAffinityGroup }))
  return null
}

export default function EditAntiAffintyGroupForm() {
  const { project, antiAffinityGroup } = useAntiAffinityGroupSelector()

  const navigate = useNavigate()

  const editAntiAffinityGroup = useApiMutation(api.antiAffinityGroupUpdate, {
    onSuccess(updatedGroup) {
      queryClient.invalidateEndpoint('antiAffinityGroupView')
      queryClient.invalidateEndpoint('antiAffinityGroupList')
      navigate(pb.antiAffinityGroup({ project, antiAffinityGroup: updatedGroup.name }))
      addToast(<>Anti-affinity group <HL>{updatedGroup.name}</HL> updated</>) // prettier-ignore
    },
  })

  const { data: group } = usePrefetchedQuery(
    antiAffinityGroupView({ project, antiAffinityGroup })
  )

  const defaultValues: AntiAffinityGroupUpdate = R.pick(group, ['name', 'description'])
  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Edit anti-affinity group"
      onDismiss={() => navigate(pb.antiAffinityGroup({ project, antiAffinityGroup }))}
      onSubmit={(values) => {
        editAntiAffinityGroup.mutate({
          path: { antiAffinityGroup },
          query: { project },
          body: values,
        })
      }}
      loading={editAntiAffinityGroup.isPending}
      submitError={editAntiAffinityGroup.error}
      submitLabel="Edit group"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
