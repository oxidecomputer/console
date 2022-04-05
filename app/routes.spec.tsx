/* eslint-disable @typescript-eslint/no-non-null-assertion */

import babel from '@babel/core'
import { traverse } from '@babel/core'
import type { JSXAttribute } from '@babel/types'
import fs from 'fs/promises'
import path from 'path'

import { matchRoutes } from 'react-router-dom'
import { renderAppAt } from './test/utils'

import { getRouteConfig, VALID_PARAMS } from './routes'

describe('routes', () => {
  it('should render successfully', async () => {
    const { findAllByText } = renderAppAt('/')
    await findAllByText('Organizations')
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

test('VALID_PARAMS should contain all dynamic path params', async () => {
  const params: Set<string> = new Set()
  const routesFile = await fs.readFile(
    path.join(__dirname, './routes.tsx'),
    'utf-8'
  )
  const ast = await parse(routesFile)

  traverse(ast, {
    JSXOpeningElement(path) {
      if ((path.node.name as babel.types.JSXIdentifier).name !== 'Route') return

      const routePath = path.node.attributes.find(
        (attr) => (attr as JSXAttribute).name.name === 'path'
      ) as JSXAttribute | undefined
      if (!routePath) return
      const { value } = routePath.value as babel.types.StringLiteral
      if (!value.startsWith(':')) return
      params.add(value.slice(1))
    },
  })

  expect(Array.from(params)).toEqual(VALID_PARAMS)
})

const parse = (src: string) =>
  babel.parseAsync(src, {
    plugins: ['@babel/plugin-syntax-typescript'],
    filename: __filename,
  })
