import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  orgName: 'a',
  projectName: 'b',
  instanceName: 'c',
  vpcName: 'd',
  siloName: 's',
  updateId: 'u',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "deviceSuccess": "/device/success",
        "diskNew": "/orgs/a/projects/b/disks-new",
        "disks": "/orgs/a/projects/b/disks",
        "instance": "/orgs/a/projects/b/instances/c",
        "instanceMetrics": "/orgs/a/projects/b/instances/c/metrics",
        "instanceNew": "/orgs/a/projects/b/instances-new",
        "instancePage": "/orgs/a/projects/b/instances/c/storage",
        "instanceStorage": "/orgs/a/projects/b/instances/c/storage",
        "instances": "/orgs/a/projects/b/instances",
        "nics": "/orgs/a/projects/b/instances/c/network-interfaces",
        "org": "/orgs/a",
        "orgAccess": "/orgs/a/access",
        "orgEdit": "/orgs/a/edit",
        "orgNew": "/orgs-new",
        "orgs": "/orgs",
        "profile": "/settings/profile",
        "project": "/orgs/a/projects/b",
        "projectAccess": "/orgs/a/projects/b/access",
        "projectEdit": "/orgs/a/projects/b/edit",
        "projectImages": "/orgs/a/projects/b/images",
        "projectNew": "/orgs/a/projects-new",
        "projects": "/orgs/a/projects",
        "serialConsole": "/orgs/a/projects/b/instances/c/serial-console",
        "settings": "/settings",
        "silo": "/sys/silos/s",
        "siloAccess": "/access",
        "siloIdpNew": "/sys/silos/s/idps-new",
        "siloNew": "/sys/silos-new",
        "siloUtilization": "/utilization",
        "silos": "/sys/silos",
        "snapshotNew": "/orgs/a/projects/b/snapshots-new",
        "snapshots": "/orgs/a/projects/b/snapshots",
        "sshKeyNew": "/settings/ssh-keys-new",
        "sshKeys": "/settings/ssh-keys",
        "system": "/sys",
        "systemHealth": "/sys/health",
        "systemInventory": "/sys/inventory",
        "systemIssues": "/sys/issues",
        "systemNetworking": "/sys/networking",
        "systemSettings": "/sys/settings",
        "systemUpdate": "/sys/update",
        "systemUpdateDetail": "/sys/update/updates/u",
        "systemUtilization": "/sys/utilization",
        "vpc": "/orgs/a/projects/b/vpcs/d",
        "vpcEdit": "/orgs/a/projects/b/vpcs/d/edit",
        "vpcNew": "/orgs/a/projects/b/vpcs-new",
        "vpcs": "/orgs/a/projects/b/vpcs",
      }
    `)
})
