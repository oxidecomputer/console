import { useMemo } from 'react'

import type { ProjectRolesPolicy } from '@oxide/api'
import { useApiMutation } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import { ComboboxField, Form } from 'app/components/form'
import type { PrebuiltFormProps } from 'app/forms'
import { useParams } from 'app/hooks'

type AddUserValues = {
  userId: string
}

const initialValues = {
  userId: '',
}

export function AddUserToProjectForm(
  props: PrebuiltFormProps<AddUserValues, ProjectRolesPolicy>
) {
  const projectParams = useParams('orgName', 'projectName')
  const { data: users } = useApiQuery('usersGet', {})
  const { data: policy } = useApiQuery(
    'organizationProjectsGetProjectPolicy',
    projectParams
  )
  const userItems = useMemo(() => users?.items.map((u) => u.name) || [], [users])

  const updatePolicy = useApiMutation('organizationProjectsPutProjectPolicy')

  return (
    <Form
      title="Add user to project"
      id="add-user-to-project-form"
      initialValues={initialValues}
      onSubmit={() => {
        // TODO: merge the added user with existing policy obviously
        updatePolicy.mutate({
          ...projectParams,
          body: policy,
        })
      }}
      mutation={updatePolicy}
      {...props}
    >
      <ComboboxField
        id="userId"
        name="userId"
        // TODO: if user names can be non-unique (and they obviously should be)
        // we need to support objects as items so we can put both name and id in there
        items={userItems}
        label="User"
        required
      />
      <Form.Actions>
        <Form.Submit>Add user</Form.Submit>
        <Form.Cancel />
      </Form.Actions>
    </Form>
  )
}
