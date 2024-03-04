/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type SiloCreate } from '@oxide/api'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { NumberField } from '~/components/form/fields/NumberField'
import { RadioField } from '~/components/form/fields/RadioField'
import { TextField } from '~/components/form/fields/TextField'
import { TlsCertsField } from '~/components/form/fields/TlsCertsField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useToast } from '~/hooks'
import { FormDivider } from '~/ui/lib/Divider'
import { pb } from '~/util/path-builder'

export type SiloCreateFormValues = Omit<SiloCreate, 'mappedFleetRoles'> & {
  siloAdminGetsFleetAdmin: boolean
  siloViewerGetsFleetViewer: boolean
}

const defaultValues: SiloCreateFormValues = {
  name: '',
  description: '',
  discoverable: true,
  identityMode: 'saml_jit',
  adminGroupName: '',
  tlsCertificates: [],
  siloAdminGetsFleetAdmin: false,
  siloViewerGetsFleetViewer: false,
  quotas: {
    cpus: 0,
    memory: 0,
    storage: 0,
  },
}

function validateQuota(value: number) {
  if (value < 0) return 'Must be at least 0'
}

export function CreateSiloSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const onDismiss = () => navigate(pb.silos())

  const createSilo = useApiMutation('siloCreate', {
    onSuccess(silo) {
      queryClient.invalidateQueries('siloList')
      queryClient.setQueryData('siloView', { path: { silo: silo.name } }, silo)
      addToast({ content: 'Your silo has been created' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-silo-form"
      title="Create silo"
      form={form}
      onDismiss={onDismiss}
      onSubmit={({
        adminGroupName,
        siloAdminGetsFleetAdmin,
        siloViewerGetsFleetViewer,
        ...rest
      }) => {
        const mappedFleetRoles: SiloCreate['mappedFleetRoles'] = {}
        if (siloAdminGetsFleetAdmin) {
          mappedFleetRoles['admin'] = ['admin']
        }
        if (siloViewerGetsFleetViewer) {
          mappedFleetRoles['viewer'] = ['viewer']
        }
        createSilo.mutate({
          body: {
            // no point setting it to empty string or whitespace
            adminGroupName: adminGroupName?.trim() || undefined,
            mappedFleetRoles,
            ...rest,
          },
        })
      }}
      loading={createSilo.isPending}
      submitError={createSilo.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <CheckboxField name="discoverable" control={form.control}>
        Discoverable
      </CheckboxField>
      <FormDivider />
      <NumberField
        control={form.control}
        label="CPU quota"
        name="quotas.cpus"
        required
        units="nCPUs"
        validate={validateQuota}
      />
      <NumberField
        control={form.control}
        label="Memory quota"
        name="quotas.memory"
        required
        units="GiB"
        validate={validateQuota}
      />
      <NumberField
        control={form.control}
        label="Storage quota"
        name="quotas.storage"
        required
        units="GiB"
        validate={validateQuota}
      />
      <FormDivider />
      <RadioField
        name="identityMode"
        label="Identity mode"
        column
        control={form.control}
        items={[
          { value: 'saml_jit', label: 'SAML JIT' },
          { value: 'local_only', label: 'Local only' },
        ]}
      />
      <TextField
        name="adminGroupName"
        label="Admin group name"
        description="This group will be created and granted the Silo Admin role"
        control={form.control}
      />
      <div>
        <CheckboxField name="siloAdminGetsFleetAdmin" control={form.control}>
          Grant fleet admin role to silo admins
        </CheckboxField>
      </div>
      <div className="!mt-2">
        <CheckboxField name="siloViewerGetsFleetViewer" control={form.control}>
          Grant fleet viewer role to silo viewers
        </CheckboxField>
      </div>
      <FormDivider />
      <TlsCertsField control={form.control} />
    </SideModalForm>
  )
}
