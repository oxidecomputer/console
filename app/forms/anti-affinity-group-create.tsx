/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { queryClient, useApiMutation, type AntiAffinityGroupCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

import { antiAffinityGroupList } from './affinity-util'

export const handle = titleCrumb('New anti-affinity group')

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { project } = getProjectSelector(params)
  queryClient.prefetchQuery(antiAffinityGroupList({ project }))
  // the async demands a promise, so this just returns a promise that resolves to null
  return Promise.resolve(null)
}

export default function CreateAntiAffintyGroupForm() {
  const { project } = useProjectSelector()

  const navigate = useNavigate()
  const onDismiss = () => navigate(pb.affinity({ project }))

  const createAntiAffinityGroup = useApiMutation('antiAffinityGroupCreate', {
    onSuccess(antiAffinityGroup) {
      navigate(pb.antiAffinityGroup({ project, antiAffinityGroup: antiAffinityGroup.name }))
      addToast(<>Anti-affinity group <HL>{antiAffinityGroup.name}</HL> created</>) // prettier-ignore
      queryClient.invalidateQueries(antiAffinityGroupList({ project }))
    },
  })

  const { data: existingAntiAffinityGroups } = useQuery(antiAffinityGroupList({ project }))
  const defaultValues = {
    name: '',
    description: '',
    failureDomain: 'sled' as const,
    policy: 'allow' as const,
  }
  const form = useForm<AntiAffinityGroupCreate>({ defaultValues })
  const control = form.control

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Add anti-affinity group"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        createAntiAffinityGroup.mutate({
          query: { project },
          body: { ...values },
        })
      }}
      loading={createAntiAffinityGroup.isPending}
      submitDisabled={existingAntiAffinityGroups === undefined ? 'Loading …' : undefined}
      submitError={createAntiAffinityGroup.error}
      submitLabel="Add group"
    >
      <NameField
        name="name"
        control={control}
        validate={(name) => {
          if (existingAntiAffinityGroups?.items.find((g) => g.name === name)) {
            return 'Name taken. To update an existing group, edit it directly.'
          }
        }}
      />
      <DescriptionField name="description" control={control} />

      <RadioField
        name="policy"
        column
        control={control}
        items={[
          { value: 'allow', label: 'Allow' },
          { value: 'fail', label: 'Fail' },
        ]}
      />
    </SideModalForm>
  )
}
