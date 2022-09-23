import { pb } from './path-builder'

// params can be the same for all of them because they only use what they need
const params = {
  orgName: 'a',
  projectName: 'b',
  instanceName: 'c',
  vpcName: 'd',
  siloName: 's',
}

test('path builder', () => {
  expect(Object.fromEntries(Object.entries(pb).map(([key, fn]) => [key, fn(params)])))
    .toMatchInlineSnapshot(`
      {
        "access": "/orgs/a/projects/b/access",
        "appearance": "/settings/appearance",
        "deviceSuccess": "/device/success",
        "diskNew": "/orgs/a/projects/b/disks-new",
        "disks": "/orgs/a/projects/b/disks",
        "hotkeys": "/settings/hotkeys",
        "images": "/orgs/a/projects/b/images",
        "instance": "/orgs/a/projects/b/instances/c",
        "instanceNew": "/orgs/a/projects/b/instances-new",
        "instances": "/orgs/a/projects/b/instances",
        "org": "/orgs/a",
        "orgAccess": "/orgs/a/access",
        "orgEdit": "/orgs/a/edit",
        "orgNew": "/orgs-new",
        "orgs": "/orgs",
        "profile": "/settings/profile",
        "project": "/orgs/a/projects/b",
        "projectEdit": "/orgs/a/projects/b/edit",
        "projectNew": "/orgs/a/projects-new",
        "projects": "/orgs/a/projects",
        "serialConsole": "/orgs/a/projects/b/instances/c/serial-console",
        "settings": "/settings",
        "silo": "/system/silos/s",
        "siloNew": "/system/silos-new",
        "silos": "/system/silos",
        "snapshots": "/orgs/a/projects/b/snapshots",
        "sshKeys": "/settings/ssh-keys",
        "system": "/system",
        "systemHealth": "/system/health",
        "systemInventory": "/system/inventory",
        "systemIssues": "/system/issues",
        "systemNetworking": "/system/networking",
        "systemSettings": "/system/settings",
        "systemUpdate": "/system/update",
        "systemUtilization": "/system/utilization",
        "vpc": "/orgs/a/projects/b/vpcs/d",
        "vpcEdit": "/orgs/a/projects/b/vpcs/d/edit",
        "vpcNew": "/orgs/a/projects/b/vpcs-new",
        "vpcs": "/orgs/a/projects/b/vpcs",
      }
    `)
})
