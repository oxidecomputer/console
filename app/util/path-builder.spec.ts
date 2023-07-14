import { expect, test } from 'vitest'

import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  project: 'p',
  instance: 'i',
  vpc: 'v',
  silo: 's',
  version: 'vs',
  provider: 'pr',
  sledId: 'sl',
  image: 'im',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "deviceSuccess": "/device/success",
        "diskInventory": "/system/inventory/disks",
        "diskNew": "/projects/p/disks-new",
        "disks": "/projects/p/disks",
        "instance": "/projects/p/instances/i",
        "instanceConnect": "/projects/p/instances/i/connect",
        "instanceMetrics": "/projects/p/instances/i/metrics",
        "instanceNew": "/projects/p/instances-new",
        "instancePage": "/projects/p/instances/i/storage",
        "instanceStorage": "/projects/p/instances/i/storage",
        "instances": "/projects/p/instances",
        "nics": "/projects/p/instances/i/network-interfaces",
        "profile": "/settings/profile",
        "project": "/projects/p",
        "projectAccess": "/projects/p/access",
        "projectEdit": "/projects/p/edit",
        "projectImage": "/projects/p/images/im",
        "projectImageEdit": "/projects/p/images/im/edit",
        "projectImageNew": "/projects/p/images-new",
        "projectImages": "/projects/p/images",
        "projectNew": "/projects-new",
        "projects": "/projects",
        "rackInventory": "/system/inventory/racks",
        "samlIdp": "/system/silos/s/idps/saml/pr",
        "serialConsole": "/projects/p/instances/i/serial-console",
        "settings": "/settings",
        "silo": "/system/silos/s",
        "siloAccess": "/access",
        "siloIdpNew": "/system/silos/s/idps-new",
        "siloImage": "/images/im",
        "siloImageEdit": "/images/im/edit",
        "siloImages": "/images",
        "siloNew": "/system/silos-new",
        "siloUtilization": "/utilization",
        "silos": "/system/silos",
        "sled": "/system/inventory/sleds/sl",
        "sledInstances": "/system/inventory/sleds/sl/instances",
        "sledInventory": "/system/inventory/sleds",
        "snapshotNew": "/projects/p/snapshots-new",
        "snapshots": "/projects/p/snapshots",
        "sshKeyNew": "/settings/ssh-keys-new",
        "sshKeys": "/settings/ssh-keys",
        "system": "/system",
        "systemHealth": "/system/health",
        "systemIssues": "/system/issues",
        "systemNetworking": "/system/networking",
        "systemSettings": "/system/settings",
        "systemUtilization": "/system/utilization",
        "vpc": "/projects/p/vpcs/v",
        "vpcEdit": "/projects/p/vpcs/v/edit",
        "vpcNew": "/projects/p/vpcs-new",
        "vpcs": "/projects/p/vpcs",
      }
    `)
})
