/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('projectView', { path: { project } })
  return null
}

export function EditProjectSideModalForm() {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const projectSelector = useProjectSelector()

  const onDismiss = () => navigate(pb.projects())

  const { data: project } = usePrefetchedApiQuery('projectView', { path: projectSelector })

  const editProject = useApiMutation('projectUpdate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      // TODO: check this invalidation
      queryClient.invalidateQueries('projectList')
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData('projectView', { path: { project: project.name } }, project)
      addToast({ content: 'Your project has been updated' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues: project })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editProject.mutate({ path: projectSelector, body: { name, description } })
      }}
      loading={editProject.isPending}
      submitError={editProject.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
