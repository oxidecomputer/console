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

import { antiAffinityGroupList, antiAffinityGroupView } from './affinity-util'

export const handle = titleCrumb('New anti-affinity group')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project, antiAffinityGroup } = getAntiAffinityGroupSelector(params)
  await Promise.all([
    queryClient.prefetchQuery(antiAffinityGroupList({ project })),
    queryClient.prefetchQuery(antiAffinityGroupView({ project, antiAffinityGroup })),
  ])
  return null
}

export default function EditAntiAffintyGroupForm() {
  const { project, antiAffinityGroup } = useAntiAffinityGroupSelector()

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.antiAffinityGroup({ project, antiAffinityGroup }))

  const editAntiAffinityGroup = useApiMutation('antiAffinityGroupUpdate', {
    onSuccess(updatedAntiAffinityGroup) {
      navigate(
        pb.antiAffinityGroup({ project, antiAffinityGroup: updatedAntiAffinityGroup.name })
      )
      addToast(<>Anti-affinity group <HL>{updatedAntiAffinityGroup.name}</HL> updated</>) // prettier-ignore
      queryClient.invalidateQueries(antiAffinityGroupList({ project }))
    },
  })

  const { data: existingAntiAffinityGroups } = usePrefetchedQuery(
    antiAffinityGroupList({ project })
  )

  const { data: antiAffinityGroupData } = usePrefetchedQuery(
    antiAffinityGroupView({ project, antiAffinityGroup })
  )

  const form = useForm<AntiAffinityGroupUpdate>({
    defaultValues: { ...antiAffinityGroupData },
  })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Edit anti-affinity group"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        editAntiAffinityGroup.mutate({
          path: { antiAffinityGroup },
          query: { project },
          body: { ...values },
        })
      }}
      loading={editAntiAffinityGroup.isPending}
      submitError={editAntiAffinityGroup.error}
      submitLabel="Edit group"
    >
      <NameField
        name="name"
        control={form.control}
        validate={(name) => {
          if (existingAntiAffinityGroups.items.find((g) => g.name === name)) {
            return 'Name taken. To update an existing group, edit it directly.'
          }
        }}
      />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
