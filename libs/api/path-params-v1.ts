// these aren't really only path params anymore so we'll probably want to rename
// this file
import type { Merge } from 'type-fest'

export type Org = { organization?: string }
export type Project = Merge<Org, { project?: string }>
export type Instance = Merge<Project, { instance?: string }>
export type NetworkInterface = Merge<Instance, { interface?: string }>
