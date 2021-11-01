import { renderWithRouter } from './test-utils'
import fetchMock from 'fetch-mock'

import { projects } from '@oxide/api-mocks'

import { routes } from './routes'

describe('routes', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('should render successfully', async () => {
    fetchMock.get('/api/organizations/maze-war/projects', projects)
    const { findAllByText } = renderWithRouter(routes)
    await findAllByText(projects.items[0].name)
  })
})
