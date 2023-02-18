// these aren't really only path params anymore so we'll probably want to rename
// this file
import type { Merge } from 'type-fest'

export type Org = { organization: string }
export type Project = Merge<Partial<Org>, { project: string }>
export type Instance = Merge<Partial<Project>, { instance: string }>
