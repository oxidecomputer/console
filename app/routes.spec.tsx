import { matchRoutes } from 'react-router-dom'

import { getRouteConfig } from './routes'

describe('routeConfig', () => {
  it('should send non-existent routes to the 404 splat', () => {
    const pathname = '/abc/def/ghi'
    const matches = matchRoutes(getRouteConfig(), { pathname })!
    expect(matches.length).toEqual(2)
    // first match is just the leading slash, which every path will match
    expect(matches[0].pathname).toEqual('/')
    // second/last is the full match
    expect(matches[1]).toMatchInlineSnapshot(`
      {
        "params": {
          "*": "abc/def/ghi",
        },
        "pathname": "/abc/def/ghi",
        "pathnameBase": "/",
        "route": {
          "element": <NotFound />,
          "path": "*",
        },
      }
    `)
  })
})
