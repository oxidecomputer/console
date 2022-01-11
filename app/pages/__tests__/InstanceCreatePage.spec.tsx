import { fireEvent, renderAppAt, screen, waitFor } from '../../test-utils'
import { override } from '../../../libs/api/msw/server' // TODO: this import path is very sad

import { org, project } from '@oxide/api-mocks'

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
    // XXX mystery: this passes when run alone, fails when run all together
    override('post', instancesUrl, 400, { error_code: 'ObjectAlreadyExists' })
    renderAppAt(formUrl)

    fireEvent.click(submitButton())

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

    // TODO: once MSW data layer is in place, uncomment these and assert that
    // the name shows up in the list of instances

    // fireEvent.change(screen.getByLabelText('Choose a name'), {
    //   target: { value: 'new-instance' },
    // })
    // fireEvent.click(screen.getByLabelText(/6 CPUs/))

    fireEvent.click(submitButton())

    await waitFor(() => expect(window.location.pathname).toEqual(instancesPage))
  })
})
