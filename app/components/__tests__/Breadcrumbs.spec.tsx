/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router'
import { routeConfig } from '../../routes'
import { matchesToCrumbs } from '../Breadcrumbs'

// this is kind of an integration test because it pulls in the real route config,
// plus it's janky that it calls matchRoutes directly to get matches. but whatever
describe('matchesToCrumbs', () => {
  it('empty list on unmatched route', () => {
    const matches = matchRoutes(routeConfig, { pathname: '/abc/def/ghi' })
    expect(matches).toBeNull()
    expect(matchesToCrumbs([])).toEqual([])
  })

  it('works on project detail', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/c/orgs/maze-war/projects/prod-online',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/c/orgs/maze-war' },
      { label: 'Projects', href: '/c/orgs/maze-war/projects' },
      { label: 'prod-online', href: undefined },
    ])
  })

  it('works on new project', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/c/orgs/maze-war/projects/new',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/c/orgs/maze-war' },
      { label: 'Projects', href: '/c/orgs/maze-war/projects' },
      { label: 'Create project', href: undefined },
    ])
  })

  it('works on instance storage', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/c/orgs/maze-war/projects/prod-online/instances/db1/storage',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/c/orgs/maze-war' },
      { label: 'Projects', href: '/c/orgs/maze-war/projects' },
      {
        label: 'prod-online',
        href: '/c/orgs/maze-war/projects/prod-online',
      },
      {
        label: 'Instances',
        href: '/c/orgs/maze-war/projects/prod-online/instances',
      },
      {
        label: 'db1',
        href: '/c/orgs/maze-war/projects/prod-online/instances/db1',
      },
      { label: 'Storage', href: undefined },
    ])
  })
})
