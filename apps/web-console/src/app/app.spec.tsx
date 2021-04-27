import React from 'react'
import { render } from '../test-utils'
import fetchMock from 'fetch-mock'

import { instance, projects } from '@oxide/api-mocks'

import App from './app'

describe('App', () => {
  it('should render successfully', async () => {
    fetchMock.mock('/api/projects', projects)
    fetchMock.mock('/api/projects/prod-online/instances/db1', instance)
    const { findByText } = render(<App />)
    await findByText(projects.items[0].name)
  })
})
