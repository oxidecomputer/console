// these aren't really only path params anymore so we'll probably want to rename
// this file
import type { Merge } from 'type-fest'

export type Org = { organization?: string }
export type Project = Merge<Org, { project?: string }>
export type Instance = Merge<Project, { instance?: string }>
export type NetworkInterface = Merge<Instance, { interface?: string }>

// notes on needed helpers: sometimes you need to select an instance with
//
//   { path: { instance }, query: { project, organization } }
//
// and sometimes you need
//
//   { query: { instance, project, organization } }
//
// so converting between those two forms probably makes sense. Having a name for
// each form will probably be necessary. Another thing we often need to do is
// extract a selector from the RR path params
//
// PathBuilder probably also needs to change to take the selector form instead
// of the names
//
// we may also want to change the names of the params in the URL? on the other
// hand it's nice to be explcit that they're names if that's what they are, and
// the helpers will make it tolerable
