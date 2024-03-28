/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { PathParams as PP } from '@oxide/api'

// TODO: required versions of path params probably belong somewhere else,
// they're useful

type Project = Required<PP.Project>
type Instance = Required<PP.Instance>
type Vpc = Required<PP.Vpc>
type Silo = Required<PP.Silo>
type IdentityProvider = Required<PP.IdentityProvider>
type Sled = Required<PP.Sled>
type Image = Required<PP.Image>
type Snapshot = Required<PP.Snapshot>
type SiloImage = Required<PP.SiloImage>
type IpPool = Required<PP.IpPool>
type FloatingIp = Required<PP.FloatingIp>

export const pb = {
  projects: () => `/projects`,
  projectsNew: () => `/projects-new`,
  project: ({ project }: Project) => `${pb.projects()}/${project}`,
  projectEdit: (params: Project) => `${pb.project(params)}/edit`,

  projectAccess: (params: Project) => `${pb.project(params)}/access`,
  projectImages: (params: Project) => `${pb.project(params)}/images`,
  projectImagesNew: (params: Project) => `${pb.project(params)}/images-new`,
  projectImage: (params: Image) => `${pb.projectImages(params)}/${params.image}`,
  projectImageEdit: (params: Image) => `${pb.projectImage(params)}/edit`,

  instances: (params: Project) => `${pb.project(params)}/instances`,
  instancesNew: (params: Project) => `${pb.project(params)}/instances-new`,
  instance: (params: Instance) => `${pb.instances(params)}/${params.instance}`,

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instancePage: (params: Instance) => pb.instanceStorage(params),

  instanceMetrics: (params: Instance) => `${pb.instance(params)}/metrics`,
  instanceStorage: (params: Instance) => `${pb.instance(params)}/storage`,
  instanceConnect: (params: Instance) => `${pb.instance(params)}/connect`,

  nics: (params: Instance) => `${pb.instance(params)}/network-interfaces`,

  serialConsole: (params: Instance) => `${pb.instance(params)}/serial-console`,

  disksNew: (params: Project) => `${pb.project(params)}/disks-new`,
  disks: (params: Project) => `${pb.project(params)}/disks`,

  snapshotsNew: (params: Project) => `${pb.project(params)}/snapshots-new`,
  snapshots: (params: Project) => `${pb.project(params)}/snapshots`,
  snapshotImagesNew: (params: Snapshot) =>
    `${pb.project(params)}/snapshots/${params.snapshot}/images-new`,

  vpcsNew: (params: Project) => `${pb.project(params)}/vpcs-new`,
  vpcs: (params: Project) => `${pb.project(params)}/vpcs`,
  vpc: (params: Vpc) => `${pb.vpcs(params)}/${params.vpc}`,
  vpcEdit: (params: Vpc) => `${pb.vpc(params)}/edit`,
  floatingIps: (params: Project) => `${pb.project(params)}/floating-ips`,
  floatingIpsNew: (params: Project) => `${pb.project(params)}/floating-ips-new`,
  floatingIp: (params: FloatingIp) => `${pb.floatingIps(params)}/${params.floatingIp}`,
  floatingIpEdit: (params: FloatingIp) => `${pb.floatingIp(params)}/edit`,

  siloUtilization: () => '/utilization',
  siloAccess: () => '/access',
  siloImages: () => '/images',
  siloImage: (params: SiloImage) => `${pb.siloImages()}/${params.image}`,
  siloImageEdit: (params: SiloImage) => `${pb.siloImage(params)}/edit`,

  system: () => '/system',
  systemIssues: () => '/system/issues',
  systemUtilization: () => '/system/utilization',
  systemHealth: () => '/system/health',

  systemMonitoring: () => '/system/monitoring',
  systemMonitoringSensorTree: () => '/system/monitoring/sensor-tree',
  systemMonitoringExplore: () => '/system/monitoring/explore',
  systemMonitoringExplorer: () => '/system/monitoring/explorer',
  systemMonitoringExplorerSled: (params: { sled: string }) =>
    `/system/monitoring/explorer/sled/${params.sled}`,

  // there is only one tab on networking and it's IP pools, so we just treat
  // that as the networking route for now
  ipPools: () => '/system/networking/ip-pools',
  ipPoolsNew: () => '/system/networking/ip-pools-new',
  ipPool: (params: IpPool) => `${pb.ipPools()}/${params.pool}`,
  ipPoolEdit: (params: IpPool) => `${pb.ipPool(params)}/edit`,
  ipPoolRangeAdd: (params: IpPool) => `${pb.ipPool(params)}/ranges-add`,

  inventory: () => '/system/inventory',
  rackInventory: () => '/system/inventory/racks',
  sledInventory: () => '/system/inventory/sleds',
  diskInventory: () => '/system/inventory/disks',
  sled: ({ sledId }: Sled) => `/system/inventory/sleds/${sledId}`,
  sledInstances: ({ sledId }: Sled) => `/system/inventory/sleds/${sledId}/instances`,

  silos: () => '/system/silos',
  silosNew: () => '/system/silos-new',
  silo: ({ silo }: Silo) => `/system/silos/${silo}`,
  siloIpPools: (params: Silo) => `${pb.silo(params)}?tab=ip-pools`,
  siloIdpsNew: (params: Silo) => `${pb.silo(params)}/idps-new`,
  samlIdp: (params: IdentityProvider) => `${pb.silo(params)}/idps/saml/${params.provider}`,

  profile: () => '/settings/profile',
  sshKeys: () => '/settings/ssh-keys',
  sshKeysNew: () => '/settings/ssh-keys-new',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
