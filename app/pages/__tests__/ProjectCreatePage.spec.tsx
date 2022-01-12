import {
  fireEvent,
  override,
  renderAppAt,
  screen,
  waitFor,
} from 'app/test-utils'
import { org, project } from '@oxide/api-mocks'

const projectsUrl = `/api/organizations/${org.name}/projects`

const submitButton = () =>
  screen.getByRole('button', { name: 'Create project' })

function enterName(value: string) {
  const nameInput = screen.getByLabelText('Choose a name')
  fireEvent.change(nameInput, { target: { value } })
}

const formUrl = `/orgs/${org.name}/projects/new`

const renderPage = () => {
  const result = renderAppAt(formUrl)
  enterName('mock-project-2')
  return result
}

describe('ProjectCreatePage', () => {
  it('disables submit button on submit', async () => {
    renderPage()

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
  })

  it('shows message for known error code in project create code map', async () => {
    renderAppAt(formUrl)
    enterName(project.name) // already exists

    fireEvent.click(submitButton())

    await screen.findByText(
      'A project with that name already exists in this organization'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows message for known error code in global code map', async () => {
    override('post', projectsUrl, 403, { error_code: 'Forbidden' })
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
    override('post', projectsUrl, 400, { error_code: 'UnknownCode' })
    renderPage()

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('navigates to project instances page on success', async () => {
    renderPage()
    const projectPath = `/orgs/${org.name}/projects/mock-project-2/instances`
    expect(window.location.pathname).not.toEqual(projectPath)

    fireEvent.click(submitButton())

    await waitFor(() => expect(window.location.pathname).toEqual(projectPath))

    // TODO: navigate to projects page so you can see the project in the list?
  })
})
