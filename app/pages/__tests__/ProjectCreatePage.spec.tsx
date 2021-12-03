import React from 'react'
import {
  fireEvent,
  lastBody,
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils'
import fetchMock from 'fetch-mock'

import { org, project } from '@oxide/api-mocks'

import { ProjectCreateForm } from '../ProjectCreatePage'

const projectsUrl = `/api/organizations/${org.name}/projects`

const submitButton = () =>
  screen.getByRole('button', { name: 'Create project' })

function enterName(value: string) {
  const nameInput = screen.getByLabelText('Choose a name')
  fireEvent.change(nameInput, { target: { value } })
}

describe('ProjectCreateForm', () => {
  beforeEach(() => {
    renderWithRouter(<ProjectCreateForm orgName={org.name} />)
    enterName('valid-name')
  })

  afterEach(() => {
    fetchMock.reset()
  })

  it('disables submit button on submit and enables on response', async () => {
    const mock = fetchMock.post(projectsUrl, { status: 201 })

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    expect(mock.called()).toBeFalsy()
    await waitFor(() => expect(submit).toBeDisabled())
    expect(mock.done()).toBeTruthy()
    expect(submit).not.toBeDisabled()
  })

  it('shows message for known error code in project create code map', async () => {
    fetchMock.post(projectsUrl, {
      status: 400,
      body: { error_code: 'ObjectAlreadyExists' },
    })

    fireEvent.click(submitButton())

    await screen.findByText(
      'A project with that name already exists in this organization'
    )
  })

  it('shows message for known error code in global code map', async () => {
    fetchMock.post(projectsUrl, {
      status: 401,
      body: { error_code: 'Forbidden' },
    })

    fireEvent.click(submitButton())

    await screen.findByText('Action not authorized')
  })

  it('shows field-level validation error and does not POST', async () => {
    enterName('Invalid-name')
    fireEvent.click(submitButton())

    await screen.findByText('Must start with a lower-case letter')
  })

  it('shows generic message for unknown server error', async () => {
    fetchMock.post(projectsUrl, { status: 400 })

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
  })

  it('posts form on submit', async () => {
    const mock = fetchMock.post(projectsUrl, { status: 201 })

    fireEvent.click(submitButton())

    await waitFor(() =>
      expect(lastBody(mock)).toEqual({ name: 'valid-name', description: '' })
    )
  })

  it('navigates to project page on success', async () => {
    const mock = fetchMock.post(projectsUrl, {
      status: 201,
      body: project,
    })

    const projectPath = `/orgs/${org.name}/projects/${project.name}`
    expect(window.location.pathname).not.toEqual(projectPath)

    fireEvent.click(submitButton())

    await waitFor(() => expect(mock.called()).toBeTruthy())
    await waitFor(() => expect(mock.done()).toBeTruthy())
    await waitFor(() => expect(window.location.pathname).toEqual(projectPath))
  })
})
