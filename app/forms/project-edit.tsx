/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router'

import { apiq, queryClient, useApiMutation, usePrefetchedQuery } from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { getProjectSelector, useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const projectView = ({ project }: PP.Project) => apiq('projectView', { path: { project } })

EditProjectSideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project } = getProjectSelector(params)
  await queryClient.fetchQuery(projectView({ project }))
  return null
}

export function EditProjectSideModalForm() {
  const navigate = useNavigate()

  const projectSelector = useProjectSelector()

  const onDismiss = () => navigate(pb.projects())

  const { data: project } = usePrefetchedQuery(projectView(projectSelector))

  const editProject = useApiMutation('projectUpdate', {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateEndpoint('projectList')
      // avoid the project fetch when the project page loads since we have the data
      const { queryKey } = projectView({ project: project.name })
      queryClient.setQueryData(queryKey, project)
      addToast(<>Project <HL>{project.name}</HL> updated</>) // prettier-ignore
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
