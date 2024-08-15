/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from 'vitest'

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
  sledId: 'sl',
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
        "floatingIp": "/projects/p/floating-ips/f",
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
        "inventory": "/system/inventory",
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
        "projectImageEdit": "/projects/p/images/im/edit",
        "projectImages": "/projects/p/images",
        "projectImagesNew": "/projects/p/images-new",
        "projects": "/projects",
        "projectsNew": "/projects-new",
        "rackInventory": "/system/inventory/racks",
        "samlIdp": "/system/silos/s/idps/saml/pr",
        "serialConsole": "/projects/p/instances/i/serial-console",
        "silo": "/system/silos/s",
        "siloAccess": "/access",
        "siloIdpsNew": "/system/silos/s/idps-new",
        "siloImage": "/images/im",
        "siloImageEdit": "/images/im/edit",
        "siloImages": "/images",
        "siloIpPools": "/system/silos/s?tab=ip-pools",
        "siloUtilization": "/utilization",
        "silos": "/system/silos",
        "silosNew": "/system/silos-new",
        "sled": "/system/inventory/sleds/sl",
        "sledInstances": "/system/inventory/sleds/sl/instances",
        "sledInventory": "/system/inventory/sleds",
        "snapshotImagesNew": "/projects/p/snapshots/sn/images-new",
        "snapshots": "/projects/p/snapshots",
        "snapshotsNew": "/projects/p/snapshots-new",
        "sshKeys": "/settings/ssh-keys",
        "sshKeysNew": "/settings/ssh-keys-new",
        "system": "/system",
        "systemHealth": "/system/health",
        "systemIssues": "/system/issues",
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
