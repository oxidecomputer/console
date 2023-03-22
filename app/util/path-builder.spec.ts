import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  project: 'p',
  instance: 'i',
  vpc: 'v',
  silo: 's',
  version: 'vs',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "deviceSuccess": "/device/success",
        "diskInventory": "/sys/inventory/disks",
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
        "projectImages": "/projects/p/images",
        "projectNew": "/projects-new",
        "projects": "/projects",
        "rackInventory": "/sys/inventory/racks",
        "serialConsole": "/projects/p/instances/i/serial-console",
        "settings": "/settings",
        "silo": "/sys/silos/s",
        "siloAccess": "/access",
        "siloIdpNew": "/sys/silos/s/idps-new",
        "siloNew": "/sys/silos-new",
        "siloUtilization": "/utilization",
        "silos": "/sys/silos",
        "sledInventory": "/sys/inventory/sleds",
        "snapshotNew": "/projects/p/snapshots-new",
        "snapshots": "/projects/p/snapshots",
        "sshKeyNew": "/settings/ssh-keys-new",
        "sshKeys": "/settings/ssh-keys",
        "system": "/sys",
        "systemHealth": "/sys/health",
        "systemIssues": "/sys/issues",
        "systemNetworking": "/sys/networking",
        "systemSettings": "/sys/settings",
        "systemUpdateDetail": "/sys/update/updates/vs",
        "systemUpdateHistory": "/sys/update/history",
        "systemUpdates": "/sys/update/updates",
        "systemUtilization": "/sys/utilization",
        "updateableComponents": "/sys/update/components",
        "vpc": "/projects/p/vpcs/v",
        "vpcEdit": "/projects/p/vpcs/v/edit",
        "vpcNew": "/projects/p/vpcs-new",
        "vpcs": "/projects/p/vpcs",
      }
    `)
})
