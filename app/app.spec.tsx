import React from 'react'
import { render } from './test-utils'
import fetchMock from 'fetch-mock'

import { projects } from '@oxide/api-mocks'

import App from './app'

describe('App', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('should render successfully', async () => {
    fetchMock.get('/api/organizations/maze-war/projects', projects)
    const { findAllByText } = render(<App />)
    await findAllByText(projects.items[0].name)
  })
})
