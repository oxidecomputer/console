import {
  clickByRole,
  fireEvent,
  override,
  renderAppAt,
  screen,
  waitFor,
} from 'app/test/utils'
import { org, project } from '@oxide/api-mocks'

const projectsUrl = `/api/organizations/${org.name}/projects`

function enterName(value: string) {
  const nameInput = screen.getByLabelText('Choose a name')
  fireEvent.change(nameInput, { target: { value } })
}

const formUrl = `/orgs/${org.name}/projects/new`

describe('ProjectCreatePage', () => {
  it('shows message for known error code in project create code map', async () => {
    renderAppAt(formUrl)
    enterName(project.name) // already exists

    clickByRole('button', 'Create project')

    await screen.findByText(
      'A project with that name already exists in this organization'
    )
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows message for known error code in global code map', async () => {
    override('post', projectsUrl, 403, { error_code: 'Forbidden' })
    renderAppAt(formUrl)
    enterName('mock-project-2')

    clickByRole('button', 'Create project')

    await screen.findByText('Action not authorized')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows field-level validation error and does not POST', async () => {
    renderAppAt(formUrl)
    enterName('Invalid-name')

    clickByRole('button', 'Create project')

    await screen.findByText('Must start with a lower-case letter')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows generic message for unknown server error', async () => {
    override('post', projectsUrl, 400, { error_code: 'UnknownCode' })
    renderAppAt(formUrl)
    enterName('mock-project-2')

    clickByRole('button', 'Create project')

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('navigates to project instances page on success', async () => {
    renderAppAt(formUrl)
    enterName('mock-project-2')

    const projectPath = `/orgs/${org.name}/projects/mock-project-2/instances`
    expect(window.location.pathname).not.toEqual(projectPath)

    clickByRole('button', 'Create project')

    const submit = screen.getByRole('button', { name: 'Create project' })
    await waitFor(() => expect(submit).toBeDisabled())

    await waitFor(() => expect(window.location.pathname).toEqual(projectPath))

    // TODO: navigate to projects page so you can see the project in the list?
  })
})
