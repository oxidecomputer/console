import type { DefaultRequestBody, PathParams, RestRequest } from 'msw'
import type { Json } from '../json-type'
import { json } from './util'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = json({ error_code: 'ObjectNotFound' } as const, 404)

type Ok<T> = [T, null]
type LookupError = typeof notFoundErr // Lookups can only 404
type Err = [null, LookupError]
type Result<T> = Ok<T> | Err

// imitate Rust's Result constructors
const Ok = <T>(o: T): Ok<T> => [o, null]
const Err = (err: LookupError): Err => [null, err]

export type OrgParams = { orgName: string }
export type ProjectParams = { orgName: string; projectName: string }
export type VpcParams = {
  orgName: string
  projectName: string
  vpcName: string
}
export type InstanceParams = {
  orgName: string
  projectName: string
  instanceName: string
}
export type DiskParams = {
  orgName: string
  projectName: string
  instanceName?: string
  diskName: string
}
export type VpcSubnetParams = {
  orgName: string
  projectName: string
  vpcName: string
  subnetName: string
}

// lets us make sure you're only calling a lookup function from a handler with
// the required path params
type Req<P extends PathParams> = RestRequest<DefaultRequestBody, P>

export function lookupOrg(req: Req<OrgParams>): Result<Json<Api.Organization>> {
  const org = db.orgs.find((o) => o.name === req.params.orgName)
  if (!org) return Err(notFoundErr)
  return Ok(org)
}

export function lookupProject(req: Req<ProjectParams>): Result<Json<Api.Project>> {
  const [org, err] = lookupOrg(req)
  if (err) return Err(err)

  const project = db.projects.find(
    (p) => p.organization_id === org.id && p.name === req.params.projectName
  )
  if (!project) return Err(notFoundErr)

  return Ok(project)
}

export function lookupVpc(req: Req<VpcParams>): Result<Json<Api.Vpc>> {
  const [project, err] = lookupProject(req)
  if (err) return Err(err)

  const vpc = db.vpcs.find(
    (p) => p.project_id === project.id && p.name === req.params.vpcName
  )

  if (!vpc) return Err(notFoundErr)

  return Ok(vpc)
}

export function lookupInstance(req: Req<InstanceParams>): Result<Json<Api.Instance>> {
  const [project, err] = lookupProject(req)
  if (err) return Err(err)

  const instance = db.instances.find(
    (p) => p.project_id === project.id && p.name === req.params.instanceName
  )
  if (!instance) return Err(notFoundErr)

  return Ok(instance)
}

export function lookupDisk(req: Req<DiskParams>): Result<Json<Api.Disk>> {
  const [project, err] = lookupProject(req)
  if (err) return Err(err)

  const disk = db.disks.find(
    (d) => d.project_id === project.id && d.name === req.params.diskName
  )
  if (!disk) return Err(notFoundErr)

  return Ok(disk)
}

export function lookupVpcSubnet(req: Req<VpcSubnetParams>): Result<Json<Api.VpcSubnet>> {
  const [vpc, err] = lookupVpc(req)
  if (err) return Err(err)

  const subnet = db.vpcSubnets.find(
    (p) => p.vpc_id === vpc.id && p.name === req.params.subnetName
  )
  if (!subnet) return Err(notFoundErr)

  return Ok(subnet)
}

const initDb = {
  orgs: [mock.org],
  projects: [mock.project],
  instances: [mock.instance],
  disks: [...mock.disks],
  images: [...mock.images],
  snapshots: [...mock.snapshots],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
  vpcFirewallRules: [...mock.defaultFirewallRules],
}

const clone = (o: unknown) => JSON.parse(JSON.stringify(o))

export function resetDb() {
  db = clone(initDb)
}

export let db: typeof initDb = clone(initDb)
