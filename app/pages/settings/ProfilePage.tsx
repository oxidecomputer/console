import { PageHeader, PageTitle } from '@oxide/ui'
import type { FormMutation } from 'app/components/form'
import { Form, TextField } from 'app/components/form'

const manualMutation: FormMutation = {
  status: 'idle',
  data: undefined,
  error: null,
}

export function ProfilePage() {
  return (
    <>
      <PageHeader>
        <PageTitle>Profile</PageTitle>
      </PageHeader>
      <Form
        id="profile-form"
        title="Profile"
        initialValues={{}}
        onSubmit={() => {}}
        mutation={manualMutation}
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
      </Form>
    </>
  )
}
