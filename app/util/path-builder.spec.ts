/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RouteConfigEntry } from '@react-router/dev/routes'
import { matchRoutes, type href, type RouteObject } from 'react-router'
import * as R from 'remeda'
import { expect, expectTypeOf, test } from 'vitest'

import { nexusConsoleRoutes } from '~/api/__generated__/nexus-console'
import { matchesToCrumbs } from '~/hooks/use-crumbs'
import routeConfig from '~/routes'

import { pb } from './path-builder'

// Turn the real framework route config into route objects carrying each
// module's handle, which is what useMatches sees in the browser.
async function toRoutes(entries: RouteConfigEntry[]): Promise<RouteObject[]> {
  return Promise.all(
    entries.map(async ({ file, path, index, children }) => {
      // file is relative to the app directory
      const { handle } = await import(/* @vite-ignore */ `~/${file}`)
      return index
        ? { path, index: true, handle }
        : { path, handle, children: children && (await toRoutes(children)) }
    })
  )
}
const routes = await toRoutes(routeConfig)

// params can be the same for all of them because they only use what they need
const params = {
  affinityGroup: 'ag',
  antiAffinityGroup: 'aag',
  externalSubnet: 'es',
  floatingIp: 'f',
  gateway: 'g',
  project: 'p',
  instance: 'i',
  vpc: 'v',
  silo: 's',
  version: 'vs',
  provider: 'pr',
  sledId: '5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0',
  bundleId: 'ccdac005-66a8-4921-9e8b-30531c359c31',
  image: 'im',
  disk: 'd',
  sshKey: 'ss',
  snapshot: 'sn',
  pool: 'pl',
  subnetPool: 'sp',
  rule: 'fr',
  subnet: 'su',
  router: 'r',
  route: 'rr',
  receiver: 'rc',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "accessTokens": "/settings/access-tokens",
        "affinity": "/projects/p/affinity",
        "affinityNew": "/projects/p/affinity-new",
        "alertReceiver": "/system/alerting/receivers/rc",
        "alertReceiverEdit": "/system/alerting/receivers/rc/edit",
        "alertReceivers": "/system/alerting/receivers",
        "alertReceiversNew": "/system/alerting/receivers-new",
        "alerts": "/system/alerting/alerts",
        "antiAffinityGroup": "/projects/p/affinity/aag",
        "antiAffinityGroupEdit": "/projects/p/affinity/aag/edit",
        "auditLog": "/system/audit-log",
        "deviceSuccess": "/device/success",
        "disk": "/projects/p/disks/d",
        "diskInventory": "/system/inventory/disks",
        "disks": "/projects/p/disks",
        "disksNew": "/projects/p/disks-new",
        "externalSubnetEdit": "/projects/p/external-subnets/es/edit",
        "externalSubnets": "/projects/p/external-subnets",
        "externalSubnetsNew": "/projects/p/external-subnets-new",
        "fleetAccess": "/system/access",
        "floatingIpEdit": "/projects/p/floating-ips/f/edit",
        "floatingIps": "/projects/p/floating-ips",
        "floatingIpsNew": "/projects/p/floating-ips-new",
        "instance": "/projects/p/instances/i/storage",
        "instanceConnect": "/projects/p/instances/i/connect",
        "instanceCpuMetrics": "/projects/p/instances/i/metrics/cpu",
        "instanceDiskMetrics": "/projects/p/instances/i/metrics/disk",
        "instanceNetworkMetrics": "/projects/p/instances/i/metrics/network",
        "instanceNetworking": "/projects/p/instances/i/networking",
        "instanceSettings": "/projects/p/instances/i/settings",
        "instanceStorage": "/projects/p/instances/i/storage",
        "instances": "/projects/p/instances",
        "instancesNew": "/projects/p/instances-new",
        "ipPool": "/system/networking/ip-pools/pl",
        "ipPoolEdit": "/system/networking/ip-pools/pl/edit",
        "ipPoolRangeAdd": "/system/networking/ip-pools/pl/ranges-add",
        "ipPools": "/system/networking/ip-pools",
        "ipPoolsNew": "/system/networking/ip-pools-new",
        "profile": "/settings/profile",
        "project": "/projects/p/instances",
        "projectAccess": "/projects/p/access",
        "projectEdit": "/projects/p/edit",
        "projectImage": "/projects/p/images/im",
        "projectImages": "/projects/p/images",
        "projectImagesNew": "/projects/p/images-new",
        "projects": "/projects",
        "projectsNew": "/projects-new",
        "samlIdp": "/system/silos/s/idps/saml/pr",
        "serialConsole": "/projects/p/instances/i/serial-console",
        "silo": "/system/silos/s/idps",
        "siloAccess": "/access",
        "siloFleetRoles": "/system/silos/s/fleet-roles",
        "siloIdps": "/system/silos/s/idps",
        "siloIdpsNew": "/system/silos/s/idps-new",
        "siloImage": "/images/im",
        "siloImages": "/images",
        "siloIpPools": "/system/silos/s/ip-pools",
        "siloQuotas": "/system/silos/s/quotas",
        "siloScim": "/system/silos/s/scim",
        "siloSubnetPools": "/system/silos/s/subnet-pools",
        "siloUtilization": "/utilization",
        "silos": "/system/silos",
        "silosNew": "/system/silos-new",
        "sledInstances": "/system/inventory/sleds/5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0/instances",
        "sledInventory": "/system/inventory/sleds",
        "snapshotImagesNew": "/projects/p/snapshots/sn/images-new",
        "snapshots": "/projects/p/snapshots",
        "snapshotsNew": "/projects/p/snapshots-new",
        "sshKeyEdit": "/settings/ssh-keys/ss/edit",
        "sshKeys": "/settings/ssh-keys",
        "sshKeysNew": "/settings/ssh-keys-new",
        "subnetPool": "/system/networking/subnet-pools/sp",
        "subnetPoolEdit": "/system/networking/subnet-pools/sp/edit",
        "subnetPoolMemberAdd": "/system/networking/subnet-pools/sp/members-add",
        "subnetPools": "/system/networking/subnet-pools",
        "subnetPoolsNew": "/system/networking/subnet-pools-new",
        "supportBundle": "/system/support-bundles/ccdac005-66a8-4921-9e8b-30531c359c31",
        "supportBundles": "/system/support-bundles",
        "supportBundlesNew": "/system/support-bundles-new",
        "systemMetricsExplorer": "/system/metrics-explorer",
        "systemUpdate": "/system/update",
        "systemUtilization": "/system/utilization",
        "vpc": "/projects/p/vpcs/v/firewall-rules",
        "vpcEdit": "/projects/p/vpcs/v/edit",
        "vpcFirewallRuleClone": "/projects/p/vpcs/v/firewall-rules-new/fr",
        "vpcFirewallRuleEdit": "/projects/p/vpcs/v/firewall-rules/fr/edit",
        "vpcFirewallRules": "/projects/p/vpcs/v/firewall-rules",
        "vpcFirewallRulesNew": "/projects/p/vpcs/v/firewall-rules-new",
        "vpcInternetGateway": "/projects/p/vpcs/v/internet-gateways/g",
        "vpcInternetGateways": "/projects/p/vpcs/v/internet-gateways",
        "vpcRouter": "/projects/p/vpcs/v/routers/r",
        "vpcRouterEdit": "/projects/p/vpcs/v/routers/r/edit",
        "vpcRouterRouteEdit": "/projects/p/vpcs/v/routers/r/routes/rr/edit",
        "vpcRouterRoutesNew": "/projects/p/vpcs/v/routers/r/routes-new",
        "vpcRouters": "/projects/p/vpcs/v/routers",
        "vpcRoutersNew": "/projects/p/vpcs/v/routers-new",
        "vpcSubnets": "/projects/p/vpcs/v/subnets",
        "vpcSubnetsEdit": "/projects/p/vpcs/v/subnets/su/edit",
        "vpcSubnetsNew": "/projects/p/vpcs/v/subnets-new",
        "vpcs": "/projects/p/vpcs",
        "vpcsNew": "/projects/p/vpcs-new",
      }
    `)
})

// matchRoutes can't return null because the * route matches every path
const navCrumbs = (pathname: string) =>
  matchesToCrumbs(
    matchRoutes(routes, pathname)!.map((m) => ({ ...m, handle: m.route.handle }))
  ).filter(({ titleOnly }) => !titleOnly)

// run every route in the path builder through the crumbs logic
test('breadcrumbs', () => {
  const pairs = Object.entries(pb).map(([key, fn]) => {
    const pathname = fn(params)
    const crumbs = navCrumbs(pathname).map(R.omit(['titleOnly']))
    return [`${key} (${pathname})`, crumbs] as const
  })

  const zeroCrumbKeys = pairs
    .filter(([_, crumbs]) => crumbs.length === 0)
    .map(([key]) => key)
  expect(zeroCrumbKeys).toMatchInlineSnapshot(`
    [
      "deviceSuccess (/device/success)",
    ]
  `)

  expect(Object.fromEntries(pairs)).toMatchSnapshot()
})

// Some pages don't have self-referential breadcrumbs (like /instances-new). But
// these pages also aren't _targeted_ by breadcrumbs! Any page that's targeted
// by a breadcrumb should be able to point to itself.
test('every page reachable by breadcrumb should have a self-referential breadcrumb', () => {
  // as far as react router is concerned, /blah and /blah/ are equivalent
  const dropFinalSlash = (p: string) => p.replace(/\/$/, '')

  const allPaths = new Set(
    Object.values(pb).flatMap((fn) => navCrumbs(fn(params)).map(({ path }) => path))
  )

  for (const path of allPaths) {
    const last = R.last(navCrumbs(path))
    if (last === undefined) expect.fail(`Found no breadcrumbs for ${path}`)
    expect(dropFinalSlash(path)).toEqual(dropFinalSlash(last.path))
  }
})

// These assertions fail typechecking if route type generation stops being included.
test('generated route types check paths and required params', () => {
  expectTypeOf<typeof href<'/projects/:project/edit'>>().parameters.toExtend<
    ['/projects/:project/edit', { project: string }]
  >()
  // @ts-expect-error This path is not registered in the route config.
  expectTypeOf<typeof href<'/not-a-console-route'>>()
})

// Every leaf route with its full path. Only leaves are pages: a route with
// children renders at its own path only through an index child, which is
// itself a leaf.
function leafRoutes(
  routes: RouteObject[],
  parent = ''
): { route: RouteObject; path: string }[] {
  return routes.flatMap((route) => {
    const path = [parent, route.path].filter(Boolean).join('/')
    return route.children ? leafRoutes(route.children, path) : [{ route, path: '/' + path }]
  })
}

// Expand each optional segment both ways
const expandOptional = (path: string): string[] =>
  path
    .split('/')
    .filter(Boolean)
    .reduce<string[][]>(
      (acc, seg) =>
        seg.endsWith('?')
          ? [...acc, ...acc.map((prefix) => [...prefix, seg.slice(0, -1)])]
          : acc.map((prefix) => [...prefix, seg]),
      [[]]
    )
    .map((segments) => '/' + segments.join('/'))

// Port of dropshot's lookup_route for a single template. Dropshot splits paths
// on `/` and drops empty segments, then walks a trie: `{name}` matches one
// segment and `{name:.*}` matches the rest, including nothing, so
// /projects/{path:.*} serves /projects. Checking templates one at a time gives
// the same answer as the trie because dropshot refuses to register a node with
// both literal and variable children, so a path matches at most one route.
// https://github.com/oxidecomputer/dropshot/blob/4ff9cb3/dropshot/src/router.rs#L438-L503
// https://github.com/oxidecomputer/dropshot/blob/4ff9cb3/dropshot/src/router.rs#L254-L270
function nexusServes(template: string, pathname: string) {
  const want = template.split('/').filter(Boolean)
  const have = pathname.split('/').filter(Boolean)
  for (const [i, seg] of want.entries()) {
    if (/^\{\w+:\.\*\}$/.test(seg)) return true
    if (i >= have.length) return false
    // a route param like :project only matches a Nexus param, not a literal
    if (!/^\{\w+\}$/.test(seg) && seg !== have[i]) return false
  }
  return want.length === have.length
}

// The Nexus test below is only as good as nexusServes, so check that it matches
// paths the same way dropshot does. These are the cases from dropshot's router
// tests, plus the empty wildcard match, which dropshot doesn't test but the
// console relies on for paths like /projects.
// https://github.com/oxidecomputer/dropshot/blob/4ff9cb3/dropshot/src/router.rs#L1242-L1643
test.each([
  ['/', '/', true],
  ['/', '//', true],
  ['/foo', '/foo', true],
  ['/foo', '/foo/', true],
  ['/foo', '//foo//', true],
  ['/foo', '/', false],
  ['/not{a}variable', '/not{a}variable', true],
  ['/not{a}variable', '/not{b}variable', false],
  ['/projects/{project_id}', '/projects', false],
  ['/projects/{project_id}', '/projects/', false],
  ['/projects/{project_id}', '/projects/p12345', true],
  ['/projects/{project_id}', '/projects/p12345/', true],
  ['/projects/{project_id}', '/projects///p12345//', true],
  ['/projects/{project_id}', '/projects/p12345/child', false],
  [
    '/projects/{project_id}/instances/{instance_id}/fwrules/{fwrule_id}/info',
    '/projects/p1/instances/i2/fwrules/fw3/info',
    true,
  ],
  ['/projects/{project_id}/instances', '/projects/instances', false],
  ['/projects/{project_id}/instances', '/projects//instances', false],
  ['/projects/{project_id}/instances', '/projects/foo/instances', true],
  ['/console/{path:.*}', '/console/missiles/launch', true],
  ['/console/{path:.*}', '/console', true],
  ['/console/{path:.*}', '/', false],
  // console route params only match Nexus params, not literals
  ['/projects/{project_id}', '/projects/:project', true],
  ['/projects/new', '/projects/:project', false],
])('nexusServes(%s, %s) is %s', (template, pathname, expected) => {
  expect(nexusServes(template, pathname)).toBe(expected)
})

// Nexus only serves index.html on paths it knows about, so a console route
// outside them works on client-side navigation but 404s on reload or direct
// link. If this fails, add an endpoint for the new path in omicron next to the
// existing ones, then bump OMICRON_VERSION once it merges.
// https://github.com/oxidecomputer/omicron/blob/7e18e52/nexus/external-api/src/lib.rs#L9206
test('Nexus serves the console on every route', () => {
  const unserved = R.unique(leafRoutes(routes).flatMap(({ path }) => expandOptional(path)))
    // the catch-all is for unknown paths, which Nexus is right to 404
    .filter((p) => !p.split('/').includes('*'))
    .filter((p) => !nexusConsoleRoutes.some((t) => nexusServes(t, p)))
  expect(unserved).toEqual([])
})
