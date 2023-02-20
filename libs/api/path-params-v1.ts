// these aren't really only path params anymore so we'll probably want to rename
// this file
import type { Merge } from 'type-fest'

export type Org = { organization?: string }
export type Project = Merge<Org, { project?: string }>
export type Instance = Merge<Project, { instance?: string }>
export type Disk = Merge<Project, { disk?: string }>
export type NetworkInterface = Merge<Instance, { interface?: string }>
export type Snapshot = Merge<Project, { snapshot?: string }>
export type Vpc = Merge<Project, { vpc?: string }>
export type VpcSubnet = Merge<Vpc, { subnet?: string }>
