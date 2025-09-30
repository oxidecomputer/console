/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { queryClient, useApiMutation, type AntiAffinityGroupCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

import { policyHelpText } from './affinity-util'

export const handle = titleCrumb('New anti-affinity group')

const defaultValues: Omit<AntiAffinityGroupCreate, 'failureDomain'> = {
  name: '',
  description: '',
  policy: 'allow',
}

export default function CreateAntiAffinityGroupForm() {
  const { project } = useProjectSelector()

  const navigate = useNavigate()

  const createAntiAffinityGroup = useApiMutation('antiAffinityGroupCreate', {
    onSuccess(antiAffinityGroup) {
      queryClient.invalidateEndpoint('antiAffinityGroupList')
      navigate(pb.antiAffinityGroup({ project, antiAffinityGroup: antiAffinityGroup.name }))
      addToast(<>Anti-affinity group <HL>{antiAffinityGroup.name}</HL> created</>) // prettier-ignore
    },
  })

  const form = useForm({ defaultValues })
  const control = form.control

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="rule"
      title="Add anti-affinity group"
      onDismiss={() => navigate(pb.affinity({ project }))}
      onSubmit={(values) =>
        createAntiAffinityGroup.mutate({
          query: { project },
          body: { ...values, failureDomain: 'sled' },
        })
      }
      loading={createAntiAffinityGroup.isPending}
      submitError={createAntiAffinityGroup.error}
      submitLabel="Add group"
    >
      <NameField name="name" control={control} />
      <DescriptionField name="description" control={control} />
      <RadioField
        name="policy"
        // forgive me
        description={`${policyHelpText}, i.e., when all available sleds already contain a group member.`}
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
