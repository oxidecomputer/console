import type { FormMutation } from 'app/components/form'
import { Form, TextField } from 'app/components/form'

const manualMutation: FormMutation = {
  status: 'idle',
  data: undefined,
  error: null,
}

export function ProfilePage() {
  return (
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
      <span className="inline-block">
        Your user information is managed on Okta. <br className="hidden md+:block" /> To
        update, contact your{' '}
        <a className="external-link" href="#/">
          IDP admin
        </a>
      </span>
      <Form.Actions>
        <Form.Submit disabled>Save</Form.Submit>
      </Form.Actions>
    </Form>
  )
}
