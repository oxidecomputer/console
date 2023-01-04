import type { Merge } from 'type-fest'

export type Org = { orgName: string }
export type Project = Merge<Org, { projectName: string }>
export type Vpc = Merge<Project, { vpcName: string }>
export type Instance = Merge<Project, { instanceName: string }>
export type NetworkInterface = Merge<Instance, { interfaceName: string }>
export type Disk = Merge<Project, { diskName: string }>
export type Image = Merge<Project, { imageName: string }>
export type Snapshot = Merge<Project, { snapshotName: string }>
export type DiskMetric = Merge<Disk, { metricName: string }>
export type VpcSubnet = Merge<Vpc, { subnetName: string }>
export type VpcRouter = Merge<Vpc, { routerName: string }>
export type VpcRouterRoute = Merge<VpcRouter, { routeName: string }>
export type SshKey = { sshKeyName: string }
export type GlobalImage = { imageName: string }
export type Silo = { siloName: string }
export type IdentityProvider = Merge<Silo, { providerName: string }>
export type Id = { id: string }
export type SystemMetric = { resourceName: string }
export type SystemUpdate = { id: string }
