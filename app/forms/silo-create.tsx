import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { SiloCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import {
  CheckboxField,
  DescriptionField,
  NameField,
  RadioField,
  SideModalForm,
  TextField,
} from 'app/components/form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

type FormValues = Omit<SiloCreate, 'mappedFleetRoles'> & {
  siloAdminGetsFleetAdmin: boolean
  siloViewerGetsFleetViewer: boolean
}

const defaultValues: FormValues = {
  name: '',
  description: '',
  discoverable: true,
  identityMode: 'saml_jit',
  adminGroupName: '',
  tlsCertificates: [],
  siloAdminGetsFleetAdmin: false,
  siloViewerGetsFleetViewer: false,
}

export function CreateSiloSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()
  const addToast = useToast()

  const onDismiss = () => navigate(pb.silos())

  const createSilo = useApiMutation('siloCreate', {
    onSuccess(silo) {
      queryClient.invalidateQueries('siloList', {})
      queryClient.setQueryData('siloView', { path: { silo: silo.name } }, silo)
      addToast({
        content: 'Your silo has been created',
      })
      onDismiss()
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

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
      loading={createSilo.isLoading}
      submitError={createSilo.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <CheckboxField name="discoverable" control={form.control}>
        Discoverable
      </CheckboxField>
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
        helpText="This group will be created and granted the Silo Admin role"
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
    </SideModalForm>
  )
}
