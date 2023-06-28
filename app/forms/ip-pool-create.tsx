import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { IpPoolCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { useToast } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const defaultValues: IpPoolCreate = {
  name: '',
  description: '',
}

export function CreateIpPoolSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const createIpPool = useApiMutation('ipPoolCreate', {
    onSuccess() {
      queryClient.invalidateQueries('ipPoolList')
      addToast({ content: 'Your IP pool has been created' })
      navigate(pb.systemIpPools())
    },
  })

  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      form={form}
      id="create-ip-pool-form"
      title="Create IP pool"
      onSubmit={(values) => createIpPool.mutate({ body: values })}
      onDismiss={() => navigate(pb.systemIpPools())}
      loading={createIpPool.isLoading}
      submitError={createIpPool.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
