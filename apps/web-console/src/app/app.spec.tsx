import React from 'react'
import { render } from '../test-utils'
import fetchMock from 'fetch-mock'

import App from './app'

describe('App', () => {
  it('should render successfully', async () => {
    // placeholder mocks for now
    fetchMock.mock('/api/projects', {})
    fetchMock.mock('/api/projects/prod-online/instances/db1', {})
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
