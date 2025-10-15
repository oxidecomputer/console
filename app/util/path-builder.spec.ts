/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { matchRoutes } from 'react-router'
import * as R from 'remeda'
import { expect, test } from 'vitest'

import { matchesToCrumbs } from '~/hooks/use-crumbs'
import { routes } from '~/routes'

import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  affinityGroup: 'ag',
  antiAffinityGroup: 'aag',
  floatingIp: 'f',
  gateway: 'g',
  project: 'p',
  instance: 'i',
  vpc: 'v',
  silo: 's',
  version: 'vs',
  provider: 'pr',
  sledId: '5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0',
  image: 'im',
  sshKey: 'ss',
  snapshot: 'sn',
  pool: 'pl',
  rule: 'fr',
  subnet: 'su',
  router: 'r',
  route: 'rr',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "accessTokens": "/settings/access-tokens",
        "affinity": "/projects/p/affinity",
        "affinityNew": "/projects/p/affinity-new",
        "antiAffinityGroup": "/projects/p/affinity/aag",
        "antiAffinityGroupEdit": "/projects/p/affinity/aag/edit",
        "deviceSuccess": "/device/success",
        "diskInventory": "/system/inventory/disks",
        "disks": "/projects/p/disks",
        "disksNew": "/projects/p/disks-new",
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
        "projectImageEdit": "/projects/p/images/im/edit",
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
        "siloImageEdit": "/images/im/edit",
        "siloImages": "/images",
        "siloIpPools": "/system/silos/s/ip-pools",
        "siloQuotas": "/system/silos/s/quotas",
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

// matchRoutes returns something slightly different from UIMatch
const getMatches = (pathname: string) =>
  Promise.all(
    matchRoutes(routes, pathname)!.map(async (m) => {
      // lazy can also be an object as of RR 7.5, but we never use it that way
      const lazy = typeof m.route.lazy === 'function' ? m.route.lazy : undefined
      // As we convert route modules to RR framework mode with lazy imports,
      // more and more of the routes will have their handles defined inside the
      // route module. We need to call the lazy function to import the module
      // contents and fill out the route object with it.
      const route = { ...m.route, ...(await lazy?.()) }
      return {
        pathname: m.pathname,
        params: m.params,
        handle: route.handle,
        // not used
        id: '',
        data: undefined,
      }
    })
  )

// run every route in the path builder through the crumbs logic
test('breadcrumbs', async () => {
  const pairs = await Promise.all(
    Object.entries(pb).map(async ([key, fn]) => {
      const pathname = fn(params)
      const matches = await getMatches(pathname)
      const crumbs = matchesToCrumbs(matches)
        .filter(({ titleOnly }) => !titleOnly)
        .map(R.omit(['titleOnly']))
      return [`${key} (${pathname})`, crumbs] as const
    })
  )

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
