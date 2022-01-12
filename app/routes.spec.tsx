/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router'
import { renderAppAt } from './test-utils'

import { projects } from '@oxide/api-mocks'

import { getRouteConfig } from './routes'

describe('routes', () => {
  it('should render successfully', async () => {
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
