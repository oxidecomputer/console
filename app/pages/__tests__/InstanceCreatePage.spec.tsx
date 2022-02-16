import {
  clickByRole,
  fireEvent,
  override,
  renderAppAt,
  screen,
  typeByRole,
  waitFor,
} from 'app/test-utils'
import { org, project, instance } from '@oxide/api-mocks'

const formUrl = `/orgs/${org.name}/projects/${project.name}/instances/new`

describe('InstanceCreatePage', () => {
  it('shows specific message for known server error code', async () => {
    renderAppAt(formUrl)
    typeByRole('textbox', 'Choose a name', instance.name) // already exists in db

    await clickByRole('button', 'Create instance')

    await screen.findByText(
      'An instance with that name already exists in this project'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows generic message for unknown server error', async () => {
    const createUrl = `/api/organizations/${org.name}/projects/${project.name}/instances`
    override('post', createUrl, 400, { error_code: 'UnknownCode' })
    renderAppAt(formUrl)

    await clickByRole('button', 'Create instance')

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('navigates to project instances page on success', async () => {
    renderAppAt(formUrl)

    const instancesPage = `/orgs/${org.name}/projects/${project.name}/instances`
    expect(window.location.pathname).not.toEqual(instancesPage)

    typeByRole('textbox', 'Choose a name', 'new-instance')
    fireEvent.click(screen.getByLabelText(/6 CPUs/))

    await clickByRole('button', 'Create instance')

    const submit = screen.getByRole('button', { name: 'Create instance' })
    await waitFor(() => expect(submit).toBeDisabled())

    // nav to instances list
    await waitFor(() => expect(window.location.pathname).toEqual(instancesPage))

    // new instance shows up in the list
    await screen.findByText('new-instance')
  })
})
