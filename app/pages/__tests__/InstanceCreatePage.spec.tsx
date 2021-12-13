import {
  fireEvent,
  lastPostBody,
  renderAppAt,
  screen,
  waitFor,
} from '../../test-utils'
import fetchMock from 'fetch-mock'

import { org, project, instance } from '@oxide/api-mocks'

const submitButton = () =>
  screen.getByRole('button', { name: 'Create instance' })

const projectUrl = `/api/organizations/${org.name}/projects/${project.name}`
const instancesUrl = `${projectUrl}/instances`
const disksUrl = `${projectUrl}/disks`
const vpcsUrl = `${projectUrl}/vpcs`

const renderPage = () => {
  // existing disk modal fetches disks on render even if it's not visible
  fetchMock.get(disksUrl, 200)
  fetchMock.get(vpcsUrl, 200)
  fetchMock.get(projectUrl, 200)
  return renderAppAt(`/orgs/${org.name}/projects/${project.name}/instances/new`)
}

describe('InstanceCreatePage', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('disables submit button on submit and enables on response', async () => {
    const mock = fetchMock.post(instancesUrl, 201)
    renderPage()

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    expect(mock.called(instancesUrl)).toBeFalsy()
    await waitFor(() => expect(submit).toBeDisabled())
    expect(mock.done()).toBeTruthy()
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
  })

  it('shows generic message for unknown server error', async () => {
    fetchMock.post(instancesUrl, {
      status: 400,
      body: { error_code: 'UnknownCode' },
    })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
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
    const { history } = renderPage()

    const instancesPage = `/orgs/${org.name}/projects/${project.name}/instances`
    expect(history.location.pathname).not.toEqual(instancesPage)

    fireEvent.click(submitButton())

    await waitFor(() => expect(mock.called(instancesUrl)).toBeTruthy())
    await waitFor(() => expect(mock.done()).toBeTruthy())
    await waitFor(() =>
      expect(history.location.pathname).toEqual(instancesPage)
    )
  })
})
