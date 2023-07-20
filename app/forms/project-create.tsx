/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import type { ProjectCreate } from '@oxide/api'
import { useApiMutation, useApiQueryClient } from '@oxide/api'

import { DescriptionField, NameField, SideModalForm } from 'app/components/form'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

const defaultValues: ProjectCreate = {
  name: '',
  description: '',
}

export function CreateProjectSideModalForm() {
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.projects())

  const createProject = useApiMutation('projectCreate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('projectList')
      // avoid the project fetch when the project page loads since we have the data
      queryClient.setQueryData('projectView', { path: { project: project.name } }, project)
      addToast({ content: 'Your project has been created' })
      navigate(pb.instances({ project: project.name }))
    },
  })

  // TODO: RHF docs warn about the performance impact of validating on every
  // change
  const form = useForm({ mode: 'all', defaultValues })

  return (
    <SideModalForm
      id="create-project-form"
      form={form}
      title="Create project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createProject.mutate({ body: { name, description } })
      }}
      loading={createProject.isLoading}
      submitError={createProject.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
