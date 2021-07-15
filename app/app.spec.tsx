import React from 'react'
import { fireEvent, render, waitFor } from './test-utils'
import fetchMock from 'fetch-mock'

import { project, projects } from '@oxide/api-mocks'

import App from './app'

describe('App', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('should render successfully', async () => {
    fetchMock.get('/api/projects', projects)
    const { findAllByText } = render(<App />)
    await findAllByText(projects.items[0].name)
  })

  // TODO: this should probably be in a test specifically for project create,
  // but I need figure out how to mock the router
  it('can show errors on project create', async () => {
    fetchMock.get('/api/projects', projects)
    const tl = render(<App />)

    fireEvent.click(tl.getByText('New project'))

    tl.getByText('Create a new project')
    const submit = tl.getByRole('button', { name: 'Create project' })

    // display hard coded message for recognized error code
    fetchMock.post('/api/projects', {
      status: 400,
      body: { error_code: 'ObjectAlreadyExists' },
    })
    fireEvent.click(submit)
    await tl.findByText(
      'A project with that name already exists in this organization'
    )

    // same thing but with an unknown error
    fetchMock.post('/api/projects', { status: 400 }, { overwriteRoutes: true })
    fireEvent.click(submit)
    await tl.findByText('Unknown error from server')

    // TODO: decide whether to also assert submit button disables and enables
    // (it's trivial but it clutters up the test a bit)
  })

  it('can create project', async () => {
    fetchMock.get('/api/projects', projects)
    const tl = render(<App />)

    fireEvent.click(tl.getByText('New project'))

    tl.getByText('Create a new project')
    const submit = tl.getByRole('button', { name: 'Create project' })

    const newProject = {
      ...project,
      id: 'new-project-uuid',
      name: 'new-project',
    }

    // mock successful create and fetches for project page
    fetchMock.post('/api/projects', { status: 201, body: newProject })
    fetchMock.get('/api/projects/new-project', newProject)
    fetchMock.get('/api/projects/new-project/instances?limit=3', { items: [] })

    fireEvent.click(submit)
    await waitFor(() => expect(submit).toBeDisabled())

    // we've landed on the empty overview page for the new project
    await tl.findByRole('heading', { name: 'new-project' })
    tl.getByText('No instances yet')
    tl.getByText('Create instance')
  })
})
