/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type * as PP from './path-params.ts'

// these are used as the basis for many routes but are not themselves routes we
// ever want to link to. so we use this to build the routes but pb.project() is
// different (includes /instances)
const projectBase = ({ project }: PP.Project) => `${pb.projects()}/${project}`
const instanceBase = ({ project, instance }: PP.Instance) =>
  `${pb.instances({ project })}/${instance}`
const vpcBase = ({ project, vpc }: PP.Vpc) => `${pb.vpcs({ project })}/${vpc}`

export const pb = {
  projects: () => `/projects`,
  projectsNew: () => `/projects-new`,
  project: (params: PP.Project) => `${projectBase(params)}/instances`,
  projectEdit: (params: PP.Project) => `${projectBase(params)}/edit`,

  projectAccess: (params: PP.Project) => `${projectBase(params)}/access`,
  projectImages: (params: PP.Project) => `${projectBase(params)}/images`,
  projectImagesNew: (params: PP.Project) => `${projectBase(params)}/images-new`,
  projectImageEdit: (params: PP.Image) =>
    `${pb.projectImages(params)}/${params.image}/edit`,

  instances: (params: PP.Project) => `${projectBase(params)}/instances`,
  instancesNew: (params: PP.Project) => `${projectBase(params)}/instances-new`,

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instance: (params: PP.Instance) => pb.instanceStorage(params),

  instanceMetrics: (params: PP.Instance) => `${instanceBase(params)}/metrics`,
  instanceStorage: (params: PP.Instance) => `${instanceBase(params)}/storage`,
  instanceConnect: (params: PP.Instance) => `${instanceBase(params)}/connect`,
  instanceNetworking: (params: PP.Instance) => `${instanceBase(params)}/networking`,
  serialConsole: (params: PP.Instance) => `${instanceBase(params)}/serial-console`,

  disksNew: (params: PP.Project) => `${projectBase(params)}/disks-new`,
  disks: (params: PP.Project) => `${projectBase(params)}/disks`,

  snapshotsNew: (params: PP.Project) => `${projectBase(params)}/snapshots-new`,
  snapshots: (params: PP.Project) => `${projectBase(params)}/snapshots`,
  snapshotImagesNew: (params: PP.Snapshot) =>
    `${projectBase(params)}/snapshots/${params.snapshot}/images-new`,

  vpcsNew: (params: PP.Project) => `${projectBase(params)}/vpcs-new`,
  vpcs: (params: PP.Project) => `${projectBase(params)}/vpcs`,

  // same deal as instance detail: go straight to first tab
  vpc: (params: PP.Vpc) => pb.vpcFirewallRules(params),
  vpcEdit: (params: PP.Vpc) => `${vpcBase(params)}/edit`,

  vpcFirewallRules: (params: PP.Vpc) => `${vpcBase(params)}/firewall-rules`,
  vpcFirewallRulesNew: (params: PP.Vpc) => `${vpcBase(params)}/firewall-rules-new`,
  vpcFirewallRuleClone: (params: PP.FirewallRule) =>
    `${pb.vpcFirewallRulesNew(params)}/${params.rule}`,
  vpcFirewallRuleEdit: (params: PP.FirewallRule) =>
    `${pb.vpcFirewallRules(params)}/${params.rule}/edit`,
  vpcRouters: (params: PP.Vpc) => `${vpcBase(params)}/routers`,
  vpcRoutersNew: (params: PP.Vpc) => `${vpcBase(params)}/routers-new`,
  vpcRouter: (params: PP.VpcRouter) => `${pb.vpcRouters(params)}/${params.router}`,
  vpcRouterEdit: (params: PP.VpcRouter) => `${pb.vpcRouter(params)}/edit`,
  vpcRouterRouteEdit: (params: PP.VpcRouterRoute) =>
    `${pb.vpcRouter(params)}/routes/${params.route}/edit`,
  vpcRouterRoutesNew: (params: PP.VpcRouter) => `${pb.vpcRouter(params)}/routes-new`,

  vpcSubnets: (params: PP.Vpc) => `${vpcBase(params)}/subnets`,
  vpcSubnetsNew: (params: PP.Vpc) => `${vpcBase(params)}/subnets-new`,
  vpcSubnetsEdit: (params: PP.VpcSubnet) =>
    `${pb.vpcSubnets(params)}/${params.subnet}/edit`,

  vpcInternetGateways: (params: PP.Vpc) => `${vpcBase(params)}/internet-gateways`,
  vpcInternetGateway: (params: PP.VpcInternetGateway) =>
    `${pb.vpcInternetGateways(params)}/${params.gateway}`,
  // vpcInternetGatewaysNew: (params: Vpc) => `${vpcBase(params)}/internet-gateways-new`,
  //
  floatingIps: (params: PP.Project) => `${projectBase(params)}/floating-ips`,
  floatingIpsNew: (params: PP.Project) => `${projectBase(params)}/floating-ips-new`,
  floatingIpEdit: (params: PP.FloatingIp) =>
    `${pb.floatingIps(params)}/${params.floatingIp}/edit`,

  siloUtilization: () => '/utilization',
  siloAccess: () => '/access',
  siloImages: () => '/images',
  siloImageEdit: (params: PP.SiloImage) => `${pb.siloImages()}/${params.image}/edit`,

  systemUtilization: () => '/system/utilization',

  ipPools: () => '/system/networking/ip-pools',
  ipPoolsNew: () => '/system/networking/ip-pools-new',
  ipPool: (params: PP.IpPool) => `${pb.ipPools()}/${params.pool}`,
  ipPoolEdit: (params: PP.IpPool) => `${pb.ipPool(params)}/edit`,
  ipPoolRangeAdd: (params: PP.IpPool) => `${pb.ipPool(params)}/ranges-add`,

  sledInventory: () => '/system/inventory/sleds',
  diskInventory: () => '/system/inventory/disks',
  sled: ({ sledId }: PP.Sled) => `/system/inventory/sleds/${sledId}/instances`,
  sledInstances: ({ sledId }: PP.Sled) => `/system/inventory/sleds/${sledId}/instances`,

  silos: () => '/system/silos',
  silosNew: () => '/system/silos-new',
  silo: ({ silo }: PP.Silo) => `/system/silos/${silo}`,
  siloIpPools: (params: PP.Silo) => `${pb.silo(params)}?tab=ip-pools`,
  siloIdpsNew: (params: PP.Silo) => `${pb.silo(params)}/idps-new`,
  samlIdp: (params: PP.IdentityProvider) =>
    `${pb.silo(params)}/idps/saml/${params.provider}`,

  profile: () => '/settings/profile',
  sshKeys: () => '/settings/ssh-keys',
  sshKeysNew: () => '/settings/ssh-keys-new',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
