/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { href } from 'react-router'

import type * as PP from './path-params.ts'

export const instanceMetricsBase = (params: PP.Instance) =>
  href('/projects/:project/instances/:instance/metrics', params)
export const inventoryBase = () => href('/system/inventory')
export const alertingBase = () => href('/system/alerting')

export const pb = {
  projects: () => href('/projects'),
  projectsNew: () => href('/projects-new'),
  project: (params: PP.Project) => href('/projects/:project/instances', params),
  projectEdit: (params: PP.Project) => href('/projects/:project/edit', params),

  projectAccess: (params: PP.Project) => href('/projects/:project/access', params),
  projectImages: (params: PP.Project) => href('/projects/:project/images', params),
  projectImagesNew: (params: PP.Project) => href('/projects/:project/images-new', params),
  projectImage: (params: PP.Image) => href('/projects/:project/images/:image', params),

  instances: (params: PP.Project) => href('/projects/:project/instances', params),
  instancesNew: (params: PP.Project) => href('/projects/:project/instances-new', params),

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instance: (params: PP.Instance) => pb.instanceStorage(params),

  instanceCpuMetrics: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/metrics/cpu', params),
  instanceDiskMetrics: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/metrics/disk', params),
  instanceNetworkMetrics: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/metrics/network', params),
  instanceStorage: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/storage', params),
  instanceConnect: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/connect', params),
  instanceNetworking: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/networking', params),
  serialConsole: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/serial-console', params),
  instanceSettings: (params: PP.Instance) =>
    href('/projects/:project/instances/:instance/settings', params),

  disksNew: (params: PP.Project) => href('/projects/:project/disks-new', params),
  disks: (params: PP.Project) => href('/projects/:project/disks', params),
  disk: (params: PP.Disk) => href('/projects/:project/disks/:disk', params),

  snapshotsNew: (params: PP.Project) => href('/projects/:project/snapshots-new', params),
  snapshots: (params: PP.Project) => href('/projects/:project/snapshots', params),
  snapshotImagesNew: (params: PP.Snapshot) =>
    href('/projects/:project/snapshots/:snapshot/images-new', params),

  vpcsNew: (params: PP.Project) => href('/projects/:project/vpcs-new', params),
  vpcs: (params: PP.Project) => href('/projects/:project/vpcs', params),

  // same deal as instance detail: go straight to first tab
  vpc: (params: PP.Vpc) => pb.vpcFirewallRules(params),
  vpcEdit: (params: PP.Vpc) => href('/projects/:project/vpcs/:vpc/edit', params),

  vpcFirewallRules: (params: PP.Vpc) =>
    href('/projects/:project/vpcs/:vpc/firewall-rules', params),
  vpcFirewallRulesNew: ({ project, vpc }: PP.Vpc) =>
    href('/projects/:project/vpcs/:vpc/firewall-rules-new/:rule?', { project, vpc }),
  vpcFirewallRuleClone: (params: PP.FirewallRule) =>
    href('/projects/:project/vpcs/:vpc/firewall-rules-new/:rule?', params),
  vpcFirewallRuleEdit: (params: PP.FirewallRule) =>
    href('/projects/:project/vpcs/:vpc/firewall-rules/:rule/edit', params),
  vpcRouters: (params: PP.Vpc) => href('/projects/:project/vpcs/:vpc/routers', params),
  vpcRoutersNew: (params: PP.Vpc) =>
    href('/projects/:project/vpcs/:vpc/routers-new', params),
  vpcRouter: (params: PP.VpcRouter) =>
    href('/projects/:project/vpcs/:vpc/routers/:router', params),
  vpcRouterEdit: (params: PP.VpcRouter) =>
    href('/projects/:project/vpcs/:vpc/routers/:router/edit', params),
  vpcRouterRouteEdit: (params: PP.VpcRouterRoute) =>
    href('/projects/:project/vpcs/:vpc/routers/:router/routes/:route/edit', params),
  vpcRouterRoutesNew: (params: PP.VpcRouter) =>
    href('/projects/:project/vpcs/:vpc/routers/:router/routes-new', params),

  vpcSubnets: (params: PP.Vpc) => href('/projects/:project/vpcs/:vpc/subnets', params),
  vpcSubnetsNew: (params: PP.Vpc) =>
    href('/projects/:project/vpcs/:vpc/subnets-new', params),
  vpcSubnetsEdit: (params: PP.VpcSubnet) =>
    href('/projects/:project/vpcs/:vpc/subnets/:subnet/edit', params),

  vpcInternetGateways: (params: PP.Vpc) =>
    href('/projects/:project/vpcs/:vpc/internet-gateways', params),
  vpcInternetGateway: (params: PP.VpcInternetGateway) =>
    href('/projects/:project/vpcs/:vpc/internet-gateways/:gateway', params),
  // vpcInternetGatewaysNew: (params: Vpc) => `${vpcBase(params)}/internet-gateways-new`,
  //
  externalSubnets: (params: PP.Project) =>
    href('/projects/:project/external-subnets', params),
  externalSubnetsNew: (params: PP.Project) =>
    href('/projects/:project/external-subnets-new', params),
  externalSubnetEdit: (params: PP.ExternalSubnet) =>
    href('/projects/:project/external-subnets/:externalSubnet/edit', params),

  floatingIps: (params: PP.Project) => href('/projects/:project/floating-ips', params),
  floatingIpsNew: (params: PP.Project) =>
    href('/projects/:project/floating-ips-new', params),
  floatingIpEdit: (params: PP.FloatingIp) =>
    href('/projects/:project/floating-ips/:floatingIp/edit', params),

  affinity: (params: PP.Project) => href('/projects/:project/affinity', params),
  affinityNew: (params: PP.Project) => href('/projects/:project/affinity-new', params),
  antiAffinityGroup: (params: PP.AntiAffinityGroup) =>
    href('/projects/:project/affinity/:antiAffinityGroup', params),
  antiAffinityGroupEdit: (params: PP.AntiAffinityGroup) =>
    href('/projects/:project/affinity/:antiAffinityGroup/edit', params),

  siloUtilization: () => href('/utilization'),
  siloAccess: () => href('/access'),
  siloImages: () => href('/images'),
  siloImage: (params: PP.SiloImage) => href('/images/:image', params),

  fleetAccess: () => href('/system/access'),
  systemUtilization: () => href('/system/utilization'),

  ipPools: () => href('/system/networking/ip-pools'),
  ipPoolsNew: () => href('/system/networking/ip-pools-new'),
  ipPool: (params: PP.IpPool) => href('/system/networking/ip-pools/:pool', params),
  ipPoolEdit: (params: PP.IpPool) => href('/system/networking/ip-pools/:pool/edit', params),
  ipPoolRangeAdd: (params: PP.IpPool) =>
    href('/system/networking/ip-pools/:pool/ranges-add', params),

  subnetPools: () => href('/system/networking/subnet-pools'),
  subnetPoolsNew: () => href('/system/networking/subnet-pools-new'),
  subnetPool: (params: PP.SubnetPool) =>
    href('/system/networking/subnet-pools/:subnetPool', params),
  subnetPoolEdit: (params: PP.SubnetPool) =>
    href('/system/networking/subnet-pools/:subnetPool/edit', params),
  subnetPoolMemberAdd: (params: PP.SubnetPool) =>
    href('/system/networking/subnet-pools/:subnetPool/members-add', params),

  alerts: () => href('/system/alerting/alerts'),
  alertReceivers: () => href('/system/alerting/receivers'),
  alertReceiversNew: () => href('/system/alerting/receivers-new'),
  alertReceiver: (params: PP.AlertReceiver) =>
    href('/system/alerting/receivers/:receiver', params),
  alertReceiverEdit: (params: PP.AlertReceiver) =>
    href('/system/alerting/receivers/:receiver/edit', params),

  sledInventory: () => href('/system/inventory/sleds'),
  diskInventory: () => href('/system/inventory/disks'),
  sledInstances: (params: PP.Sled) =>
    href('/system/inventory/sleds/:sledId/instances', params),

  silos: () => href('/system/silos'),
  silosNew: () => href('/system/silos-new'),
  // canonical route for silo is first tab
  silo: (params: PP.Silo) => pb.siloIdps(params),
  siloIdps: (params: PP.Silo) => href('/system/silos/:silo/idps', params),
  siloIdpsNew: (params: PP.Silo) => href('/system/silos/:silo/idps-new', params),
  siloIpPools: (params: PP.Silo) => href('/system/silos/:silo/ip-pools', params),
  siloSubnetPools: (params: PP.Silo) => href('/system/silos/:silo/subnet-pools', params),
  siloQuotas: (params: PP.Silo) => href('/system/silos/:silo/quotas', params),
  siloFleetRoles: (params: PP.Silo) => href('/system/silos/:silo/fleet-roles', params),
  siloScim: (params: PP.Silo) => href('/system/silos/:silo/scim', params),
  samlIdp: (params: PP.IdentityProvider) =>
    href('/system/silos/:silo/idps/saml/:provider', params),

  systemUpdate: () => href('/system/update'),

  supportBundles: () => href('/system/support-bundles'),
  supportBundlesNew: () => href('/system/support-bundles-new'),
  supportBundle: (params: PP.SupportBundle) =>
    href('/system/support-bundles/:bundleId', params),
  auditLog: () => href('/system/audit-log'),

  profile: () => href('/settings/profile'),
  sshKeys: () => href('/settings/ssh-keys'),
  sshKeysNew: () => href('/settings/ssh-keys-new'),
  sshKeyEdit: (params: PP.SshKey) => href('/settings/ssh-keys/:sshKey/edit', params),
  accessTokens: () => href('/settings/access-tokens'),

  deviceSuccess: () => href('/device/success'),
}
