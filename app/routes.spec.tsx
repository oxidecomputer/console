/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router'
import { renderAppAt } from './test-utils'
import fetchMock from 'fetch-mock'

import { projects, sessionMe } from '@oxide/api-mocks'

import { getRouteConfig } from './routes'

describe('routes', () => {
  afterEach(() => {
    fetchMock.reset()
  })

  it('should render successfully', async () => {
    fetchMock.get('/api/session/me', { status: 200, body: sessionMe })
    fetchMock.get('/api/organizations/maze-war/projects', projects)
    const { findAllByText } = renderAppAt('/')
    await findAllByText(projects.items[0].name)
  })
})

describe('routeConfig', () => {
  it('should send non-existent routes to the 404 splat', () => {
    const pathname = '/abc/def/ghi'
    const matches = matchRoutes(getRouteConfig(), { pathname })!
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
