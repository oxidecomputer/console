/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router'
import { renderWithRouter } from './test-utils'
import fetchMock from 'fetch-mock'

import { projects } from '@oxide/api-mocks'

import { routes, routeConfig } from './routes'

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

describe('routeConfig', () => {
  it('should send non-existent routes to the 404 splat', () => {
    const pathname = '/abc/def/ghi'
    const matches = matchRoutes(routeConfig, { pathname })!
    expect(matches.length).toEqual(2)
    // first match is just the leading slash, which every path will match
    expect(matches[0].pathname).toEqual('/')
    // second/last is the full match
    expect(matches[1]).toMatchInlineSnapshot(`
      Object {
        "params": Object {
          "*": "abc/def/ghi",
        },
        "pathname": "/abc/def/ghi",
        "pathnameBase": "/",
        "route": Object {
          "element": <NotFound />,
          "path": "*",
        },
      }
    `)
  })
})
