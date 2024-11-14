/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { matchRoutes } from 'react-router-dom'
import * as R from 'remeda'
import { expect, test } from 'vitest'

import { matchesToCrumbs } from '~/hooks/use-crumbs'
import { routes } from '~/routes'

import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  floatingIp: 'f',
  project: 'p',
  instance: 'i',
  vpc: 'v',
  silo: 's',
  version: 'vs',
  provider: 'pr',
  sledId: '5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0',
  image: 'im',
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
        "deviceSuccess": "/device/success",
        "diskInventory": "/system/inventory/disks",
        "disks": "/projects/p/disks",
        "disksNew": "/projects/p/disks-new",
        "floatingIpEdit": "/projects/p/floating-ips/f/edit",
        "floatingIps": "/projects/p/floating-ips",
        "floatingIpsNew": "/projects/p/floating-ips-new",
        "instance": "/projects/p/instances/i/storage",
        "instanceConnect": "/projects/p/instances/i/connect",
        "instanceMetrics": "/projects/p/instances/i/metrics",
        "instanceNetworking": "/projects/p/instances/i/networking",
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
        "silo": "/system/silos/s",
        "siloAccess": "/access",
        "siloIdpsNew": "/system/silos/s/idps-new",
        "siloImageEdit": "/images/im/edit",
        "siloImages": "/images",
        "siloIpPools": "/system/silos/s?tab=ip-pools",
        "siloUtilization": "/utilization",
        "silos": "/system/silos",
        "silosNew": "/system/silos-new",
        "sled": "/system/inventory/sleds/5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0/instances",
        "sledInstances": "/system/inventory/sleds/5c56b522-c9b8-49e4-9f9a-8d52a89ec3e0/instances",
        "sledInventory": "/system/inventory/sleds",
        "snapshotImagesNew": "/projects/p/snapshots/sn/images-new",
        "snapshots": "/projects/p/snapshots",
        "snapshotsNew": "/projects/p/snapshots-new",
        "sshKeys": "/settings/ssh-keys",
        "sshKeysNew": "/settings/ssh-keys-new",
        "systemUtilization": "/system/utilization",
        "vpc": "/projects/p/vpcs/v/firewall-rules",
        "vpcEdit": "/projects/p/vpcs/v/edit",
        "vpcFirewallRuleClone": "/projects/p/vpcs/v/firewall-rules-new/fr",
        "vpcFirewallRuleEdit": "/projects/p/vpcs/v/firewall-rules/fr/edit",
        "vpcFirewallRules": "/projects/p/vpcs/v/firewall-rules",
        "vpcFirewallRulesNew": "/projects/p/vpcs/v/firewall-rules-new",
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
  matchRoutes(routes, pathname)!.map((m) => ({
    pathname: m.pathname,
    params: m.params,
    handle: m.route.handle,
    // not used
    id: '',
    data: undefined,
  }))

// run every route in the path builder through the crumbs logic
test('breadcrumbs', () => {
  const pairs = Object.entries(pb).map(([key, fn]) => {
    const pathname = fn(params)
    return [
      `${key} (${pathname})`,
      matchesToCrumbs(getMatches(pathname))
        .filter((c) => !c.titleOnly)
        // omit titleOnly because of noise in the snapshot
        .map(R.omit(['titleOnly'])),
    ] as const
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
