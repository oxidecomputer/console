/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { apiq, queryClient, useApiMutation, type ProjectCreate } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'

const defaultValues: ProjectCreate = {
  name: '',
  description: '',
}

export const handle = titleCrumb('New project')

export default function ProjectCreateSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.projects())

  const createProject = useApiMutation('projectCreate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateEndpoint('projectList')
      // avoid the project fetch when the project page loads since we have the data
      const projectView = apiq('projectView', { path: { project: project.name } })
      queryClient.setQueryData(projectView.queryKey, project)
      addToast(<>Project <HL>{project.name}</HL> created</>) // prettier-ignore
      navigate(pb.project({ project: project.name }))
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="project"
      onDismiss={onDismiss}
      onSubmit={({ name, description }) => {
        createProject.mutate({ body: { name, description } })
      }}
      loading={createProject.isPending}
      submitError={createProject.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
    </SideModalForm>
  )
}
