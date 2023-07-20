/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import type { LoaderFunctionArgs } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { apiQueryClient, useApiMutation, useApiQuery, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { pb } from 'app/util/path-builder'

import { getProjectSelector, useProjectSelector, useToast } from '../hooks'

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await apiQueryClient.prefetchQuery('projectView', { path: { project } })
  return null
}

export function EditProjectSideModalForm() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const projectSelector = useProjectSelector()

  const onDismiss = () => navigate(pb.projects())

  const { data: project } = useApiQuery('projectView', { path: projectSelector })

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

  const form = useForm({ mode: 'all', defaultValues: project })

  return (
    <SideModalForm
      id="edit-project-form"
      form={form}
      title="Edit project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        editProject.mutate({ path: projectSelector, body: { name, description } })
      }}
      loading={editProject.isLoading}
      submitError={editProject.error}
      submitLabel="Save changes"
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
