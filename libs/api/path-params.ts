import type { Merge } from 'type-fest'

export type Org = { organization?: string }
export type Project = Merge<Org, { project?: string }>
export type Instance = Merge<Project, { instance?: string }>
export type Disk = Merge<Project, { disk?: string }>
export type NetworkInterface = Merge<Instance, { interface?: string }>
export type Snapshot = Merge<Project, { snapshot?: string }>
export type Vpc = Merge<Project, { vpc?: string }>
export type VpcSubnet = Merge<Vpc, { subnet?: string }>
export type VpcRouter = Merge<Vpc, { router?: string }>
export type RouterRoute = Merge<VpcRouter, { route?: string }>
export type SystemUpdate = { version: string }
export type SiloV1 = { silo: string }

export type Id = { id: string }

// Not yet converted to v1

export type Image = { orgName: string; projectName: string; imageName: string }
export type GlobalImage = { imageName: string }
export type Silo = { siloName: string }
export type IdentityProvider = Merge<Silo, { providerName: string }>
export type SshKey = { sshKeyName: string }
