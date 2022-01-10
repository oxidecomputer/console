import {
  fireEvent,
  lastPostBody,
  renderAppAt,
  screen,
  waitFor,
} from 'app/test-utils'
import fetchMock from 'fetch-mock'

import { org, project, instance, sessionMe } from '@oxide/api-mocks'

const submitButton = () =>
  screen.getByRole('button', { name: 'Create instance' })

const projectUrl = `/api/organizations/${org.name}/projects/${project.name}`
const instancesUrl = `${projectUrl}/instances`
const disksUrl = `${projectUrl}/disks`
const vpcsUrl = `${projectUrl}/vpcs`

const formUrl = `/orgs/${org.name}/projects/${project.name}/instances/new`

const renderPage = () => {
  // existing disk modal fetches disks on render even if it's not visible
  fetchMock.get('/api/session/me', { status: 200, body: sessionMe })
  fetchMock.get(disksUrl, 200)
  fetchMock.get(vpcsUrl, 200)
  fetchMock.get(projectUrl, 200)
  return renderAppAt(formUrl)
}

describe('InstanceCreatePage', () => {
  it('disables submit button on submit', async () => {
    fetchMock.post(instancesUrl, 201)
    renderPage()

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
  })

  it('shows specific message for known server error code', async () => {
    fetchMock.post(instancesUrl, {
      status: 400,
      body: { error_code: 'ObjectAlreadyExists' },
    })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText(
      'An instance with that name already exists in this project'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows generic message for unknown server error', async () => {
    fetchMock.post(instancesUrl, {
      status: 400,
      body: { error_code: 'UnknownCode' },
    })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('posts form on submit', async () => {
    const mock = fetchMock.post(instancesUrl, 201)
    renderPage()

    fireEvent.change(screen.getByLabelText('Choose a name'), {
      target: { value: 'new-instance' },
    })
    fireEvent.click(screen.getByLabelText(/6 CPUs/))
    fireEvent.click(submitButton())

    await waitFor(() =>
      expect(lastPostBody(mock)).toEqual({
        name: 'new-instance',
        description: 'An instance in project: mock-project',
        hostname: '',
        ncpus: 6,
        memory: 25769803776,
      })
    )
  })

  it('navigates to project instances page on success', async () => {
    const mock = fetchMock.post(instancesUrl, { status: 201, body: instance })
    renderPage()

    const instancesPage = `/orgs/${org.name}/projects/${project.name}/instances`
    expect(window.location.pathname).not.toEqual(instancesPage)

    fireEvent.click(submitButton())

    await waitFor(() => expect(mock.called(instancesUrl)).toBeTruthy())
    await waitFor(() => expect(mock.done()).toBeTruthy())
    await waitFor(() => expect(window.location.pathname).toEqual(instancesPage))
  })
})
