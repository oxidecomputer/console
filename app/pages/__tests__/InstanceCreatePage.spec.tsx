import {
  fireEvent,
  override,
  renderAppAt,
  screen,
  userEvent,
  waitFor,
} from 'app/test-utils'
import { org, project, instance } from '@oxide/api-mocks'

const submitButton = () =>
  screen.getByRole('button', { name: 'Create instance' })

const projectUrl = `/api/organizations/${org.name}/projects/${project.name}`
const instancesUrl = `${projectUrl}/instances`

const formUrl = `/orgs/${org.name}/projects/${project.name}/instances/new`

describe('InstanceCreatePage', () => {
  it('disables submit button on submit', async () => {
    renderAppAt(formUrl)

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
  })

  it('shows specific message for known server error code', async () => {
    renderAppAt(formUrl)
    const name = screen.getByRole('textbox', { name: 'Choose a name' })
    await userEvent.type(name, instance.name) // already exists in db

    await userEvent.click(submitButton())

    await screen.findByText(
      'An instance with that name already exists in this project'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows generic message for unknown server error', async () => {
    override('post', instancesUrl, 400, { error_code: 'UnknownCode' })
    renderAppAt(formUrl)

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('navigates to project instances page on success', async () => {
    renderAppAt(formUrl)

    const instancesPage = `/orgs/${org.name}/projects/${project.name}/instances`
    expect(window.location.pathname).not.toEqual(instancesPage)

    const name = screen.getByRole('textbox', { name: 'Choose a name' })
    await userEvent.type(name, 'new-instance')
    await userEvent.click(screen.getByLabelText(/6 CPUs/))
    await userEvent.click(submitButton())

    // nav to instances list
    await waitFor(() => expect(window.location.pathname).toEqual(instancesPage))

    // new instance shows up in the list
    await screen.findByRole('cell', { name: 'new-instance' })
  })
})
