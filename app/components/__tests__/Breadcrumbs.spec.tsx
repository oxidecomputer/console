/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { matchRoutes } from 'react-router'
import { routeConfig } from '../../routes'
import { matchesToCrumbs } from '../Breadcrumbs'

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

  it('works on instance storage', () => {
    const matches = matchRoutes(routeConfig, {
      pathname: '/orgs/maze-war/projects/prod-online/instances/db1/storage',
    })!
    expect(matchesToCrumbs(matches)).toEqual([
      { label: 'maze-war', href: '/orgs/maze-war' },
      { label: 'Projects', href: '/orgs/maze-war/projects' },
      {
        label: 'prod-online',
        href: '/orgs/maze-war/projects/prod-online',
      },
      {
        label: 'Instances',
        href: '/orgs/maze-war/projects/prod-online/instances',
      },
      {
        label: 'db1',
        href: '/orgs/maze-war/projects/prod-online/instances/db1',
      },
      { label: 'Storage', href: undefined },
    ])
  })
})
