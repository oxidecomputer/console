import { useApiQuery } from '@oxide/api'
import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'

export function ProfilePage() {
  const { data: user } = useApiQuery('sessionMe', {})
  return (
    <FullPageForm
      id="profile-form"
      title="Profile"
      initialValues={{
        id: user?.id,
      }}
      onSubmit={() => {}}
      error={new Error('This form is not yet implemented')}
      icon={<Settings24Icon />}
    >
      <TextField
        id="profile-id"
        name="id"
        label="User ID"
        required
        disabled
        fieldClassName="!cursor-default"
      />
      <span className="inline-block text-secondary">
        <span>Your user information is managed by your organization. </span>
        <span className="md+:block">
          To update, contact your{' '}
          <a className="external-link" href="#/">
            IDP admin
          </a>
          .
        </span>
      </span>
    </FullPageForm>
  )
}
