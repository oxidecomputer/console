import { Settings24Icon } from '@oxide/ui'

import { FullPageForm, TextField } from 'app/components/form'

export function ProfilePage() {
  return (
    <FullPageForm
      id="profile-form"
      title="Profile"
      initialValues={{}}
      onSubmit={() => {}}
      error={new Error('This form is not yet implemented')}
      icon={<Settings24Icon />}
    >
      <TextField id="profile-name" name="name" required disabled />
      <TextField id="profile-username" name="username" required disabled />
      <TextField id="profile-email" name="email" required disabled />
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
