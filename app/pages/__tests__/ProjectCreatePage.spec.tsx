import {
  fireEvent,
  lastPostBody,
  renderAppAt,
  screen,
  waitFor,
} from '../../test-utils'
import fetchMock from 'fetch-mock'

import { org, project } from '@oxide/api-mocks'

const projectsUrl = `/api/organizations/${org.name}/projects`
const projectUrl = `${projectsUrl}/${project.name}`
const instancesUrl = `${projectUrl}/instances?limit=10`

const submitButton = () =>
  screen.getByRole('button', { name: 'Create project' })

function enterName(value: string) {
  const nameInput = screen.getByLabelText('Choose a name')
  fireEvent.change(nameInput, { target: { value } })
}

const formUrl = `/orgs/${org.name}/projects/new`

const renderPage = () => {
  // fetch projects list for org layout sidebar on project create
  fetchMock.get(projectsUrl, { status: 200, body: { items: [] } })
  const result = renderAppAt(formUrl)
  enterName('valid-name')
  return result
}

describe('ProjectCreatePage', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('disables submit button on submit', async () => {
    fetchMock.post(projectsUrl, { status: 201 })
    renderPage()

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
  })

  it('shows message for known error code in project create code map', async () => {
    fetchMock.post(projectsUrl, {
      status: 400,
      body: { error_code: 'ObjectAlreadyExists' },
    })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText(
      'A project with that name already exists in this organization'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows message for known error code in global code map', async () => {
    fetchMock.post(projectsUrl, {
      status: 401,
      body: { error_code: 'Forbidden' },
    })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText('Action not authorized')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows field-level validation error and does not POST', async () => {
    renderPage()
    enterName('Invalid-name')
    fireEvent.click(submitButton())

    await screen.findByText('Must start with a lower-case letter')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows generic message for unknown server error', async () => {
    fetchMock.post(projectsUrl, {
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
    const mock = fetchMock.post(projectsUrl, { status: 201 })
    renderPage()

    fireEvent.click(submitButton())

    await waitFor(() =>
      expect(lastPostBody(mock)).toEqual({
        name: 'valid-name',
        description: '',
      })
    )
  })

  it('navigates to project instances page on success', async () => {
    fetchMock.post(projectsUrl, {
      status: 201,
      body: project,
    })
    fetchMock.get(projectUrl, { status: 200 })
    // instances fetch after success
    fetchMock.get(instancesUrl, { status: 200, body: { items: [] } })

    renderPage()
    const projectPath = `/orgs/${org.name}/projects/${project.name}/instances`
    expect(window.location.pathname).not.toEqual(projectPath)

    fireEvent.click(submitButton())

    await waitFor(() => expect(window.location.pathname).toEqual(projectPath))
  })
})
