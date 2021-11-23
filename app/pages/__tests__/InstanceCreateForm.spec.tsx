import React from 'react'
import {
  fireEvent,
  lastBody,
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils'
import fetchMock from 'fetch-mock'

import { org, project, instance } from '@oxide/api-mocks'

import { InstanceCreateForm } from '../instances/create'

const submitButton = () =>
  screen.getByRole('button', { name: 'Create instance' })

const instancesUrl = `/api/organizations/${org.name}/projects/${project.name}/instances`
const disksUrl = `/api/organizations/${org.name}/projects/${project.name}/disks`

describe('InstanceCreateForm', () => {
  beforeEach(() => {
    // existing disk modal fetches disks on render even if it's not visible
    fetchMock.get(disksUrl, 200)
    renderWithRouter(
      <InstanceCreateForm orgName={org.name} projectName={project.name} />
    )
  })

  afterEach(() => {
    fetchMock.reset()
  })

  it('disables submit button on submit and enables on response', async () => {
    const mock = fetchMock.post(instancesUrl, 201)

    const submit = submitButton()
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    expect(mock.called(instancesUrl)).toBeFalsy()
    await waitFor(() => expect(submit).toBeDisabled())
    expect(mock.done()).toBeTruthy()
    expect(submit).not.toBeDisabled()
  })

  it('shows specific message for known server error code', async () => {
    fetchMock.post(instancesUrl, {
      status: 400,
      body: { error_code: 'ObjectAlreadyExists' },
    })

    fireEvent.click(submitButton())

    await screen.findByText(
      'An instance with that name already exists in this project'
    )
  })

  it('shows generic message for unknown server error', async () => {
    fetchMock.post(instancesUrl, 400)

    fireEvent.click(submitButton())

    await screen.findByText('Unknown error from server')
  })

  it('posts form on submit', async () => {
    const mock = fetchMock.post(instancesUrl, 201)

    fireEvent.change(screen.getByLabelText('Choose a name'), {
      target: { value: 'new-instance' },
    })
    fireEvent.click(screen.getByLabelText(/6 CPUs/))
    fireEvent.click(submitButton())

    await waitFor(() =>
      expect(lastBody(mock)).toEqual({
        name: 'new-instance',
        description: 'An instance in project: mock-project',
        hostname: '',
        ncpus: 6,
        memory: 25769803776,
      })
    )
  })

  it('navigates to project page on success', async () => {
    const mock = fetchMock.post(instancesUrl, { status: 201, body: instance })

    const projectPath = `/c/orgs/${org.name}/projects/${project.name}`
    expect(window.location.pathname).not.toEqual(projectPath)

    fireEvent.click(submitButton())

    await waitFor(() => expect(mock.called(instancesUrl)).toBeTruthy())
    await waitFor(() => expect(mock.done()).toBeTruthy())
    await waitFor(() => expect(window.location.pathname).toEqual(projectPath))
  })
})
