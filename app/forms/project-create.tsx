/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import type { RequiredDeep } from 'type-fest'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  type ProjectCreate,
  type ProjectCreateDefaults,
} from '@oxide/api'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

type ProjectCreateFormValues = Omit<ProjectCreate, 'defaults'> & {
  createDefaultVpc: boolean
}

const defaultValues: ProjectCreateFormValues = {
  name: '',
  description: '',
  createDefaultVpc: true,
}

export const handle = titleCrumb('New project')

export default function ProjectCreateSideModalForm() {
  const navigate = useNavigate()

  const onDismiss = () => navigate(pb.projects())

  const createProject = useApiMutation(api.projectCreate, {
    onSuccess(project) {
      // refetch list of projects in sidebar
      queryClient.invalidateEndpoint('projectList')
      // avoid the project fetch when the project page loads since we have the data
      const projectView = q(api.projectView, { path: { project: project.name } })
      queryClient.setQueryData(projectView.queryKey, project)
      // prettier-ignore
      addToast(<>Project <HL>{project.name}</HL> created</>)
      navigate(pb.project({ project: project.name }))
    },
  })

  const form = useForm({ defaultValues })
  const createDefaultVpc = form.watch('createDefaultVpc')

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="project"
      onDismiss={onDismiss}
      onSubmit={({ name, description, createDefaultVpc }) => {
        createProject.mutate({
          body: {
            name,
            description,
            // RequiredDeep will make tsc fail if an API bump adds a new
            // default resource, so we can decide how to handle it
            defaults: createDefaultVpc
              ? ({
                  vpc: { type: 'explicit', defaults: { subnet: {} } },
                } satisfies RequiredDeep<ProjectCreateDefaults>)
              : {},
          },
        })
      }}
      loading={createProject.isPending || createProject.isSuccess}
      submitError={createProject.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <div className="space-y-2">
        <CheckboxField name="createDefaultVpc" control={form.control}>
          Create default VPC and subnet
        </CheckboxField>
        {!createDefaultVpc && (
          <Message
            variant="info"
            className="max-w-lg"
            content="An instance can only attach to a VPC with a subnet"
          />
        )}
      </div>
      <SideModalFormDocs docs={[docLinks.projects]} />
    </SideModalForm>
  )
}
