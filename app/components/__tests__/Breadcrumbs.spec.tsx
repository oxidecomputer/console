/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router-dom'
import { getRouteConfig } from '../../routes'
import { matchesToCrumbs } from '../Breadcrumbs'

const routeConfig = getRouteConfig()

// this is kind of an integration test because it pulls in the real route config,
// plus it's janky that it calls matchRoutes directly to get matches. but whatever
describe('matchesToCrumbs', () => {
  it('no crumbs on unmatched route', () => {
    const matches = matchRoutes(routeConfig, { pathname: '/abc/def/ghi' })!
    expect(matchesToCrumbs(matches)).toEqual([])
  })

  it('works on project detail', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/orgs/maze-war/projects/prod-online',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/orgs/maze-war' },
      { label: 'Projects', href: '/orgs/maze-war/projects' },
      { label: 'prod-online', href: undefined },
    ])
  })

  it('works on new project', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/orgs/maze-war/projects/new',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/orgs/maze-war' },
      { label: 'Projects', href: '/orgs/maze-war/projects' },
      { label: 'Create project', href: undefined },
    ])
  })
})
