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

async function enterName(value: string) {
  const nameInput = await waitFor(() => screen.getByLabelText('Name'))
  fireEvent.change(nameInput, { target: { value } })
}

const formUrl = `/orgs/${org.name}/projects/new`

describe('ProjectCreatePage', () => {
  it.todo('shows message for known error code in project create code map', async () => {
    renderAppAt(formUrl)
    await enterName(project.name) // already exists

    clickByRole('button', 'Create project')

    await screen.findByText('A project with that name already exists in this organization')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it.todo('shows message for known error code in global code map', async () => {
    override('post', projectsUrl, 403, { error_code: 'Forbidden' })
    renderAppAt(formUrl)
    await enterName('mock-project-2')

    clickByRole('button', 'Create project')

    await screen.findByText('Action not authorized')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('shows field-level validation error and does not POST', async () => {
    renderAppAt(formUrl)
    await enterName('Invalid-name')

    clickByRole('button', 'Create project')

    await screen.findByText('Must start with a lower-case letter')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it.todo('shows generic message for unknown server error', async () => {
    override('post', projectsUrl, 400, { error_code: 'UnknownCode' })
    renderAppAt(formUrl)
    await enterName('mock-project-2')

    clickByRole('button', 'Create project')

    await screen.findByText('Unknown error from server')
    // don't nav away
    expect(window.location.pathname).toEqual(formUrl)
  })

  it('navigates back to project instances page on success', async () => {
    renderAppAt(formUrl)

    await enterName('mock-project-2')

    clickByRole('button', 'Create project')

    await waitFor(() => expect(window.location.pathname).toEqual(formUrl))

    screen.findByText('mock-project-2')
  })
})
