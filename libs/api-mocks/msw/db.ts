import type { Merge } from 'type-fest'
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
export type ProjectParams = Merge<OrgParams, { projectName: string }>
export type VpcParams = Merge<ProjectParams, { vpcName: string }>
export type InstanceParams = Merge<ProjectParams, { instanceName: string }>
export type NetworkInterfaceParams = Merge<InstanceParams, { interfaceName: string }>
export type DiskParams = Merge<ProjectParams, { instanceName?: string; diskName: string }>
export type VpcSubnetParams = Merge<VpcParams, { subnetName: string }>
export type VpcRouterParams = Merge<VpcParams, { routerName: string }>
export type SshKeyParams = { sshKeyName: string }

export function lookupOrg(params: OrgParams): Result<Json<Api.Organization>> {
  const org = db.orgs.find((o) => o.name === params.orgName)
  if (!org) return Err(notFoundErr)
  return Ok(org)
}

export function lookupProject(params: ProjectParams): Result<Json<Api.Project>> {
  const [org, err] = lookupOrg(params)
  if (err) return Err(err)

  const project = db.projects.find(
    (p) => p.organization_id === org.id && p.name === params.projectName
  )
  if (!project) return Err(notFoundErr)

  return Ok(project)
}

export function lookupVpc(params: VpcParams): Result<Json<Api.Vpc>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const vpc = db.vpcs.find((p) => p.project_id === project.id && p.name === params.vpcName)

  if (!vpc) return Err(notFoundErr)

  return Ok(vpc)
}

export function lookupInstance(params: InstanceParams): Result<Json<Api.Instance>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const instance = db.instances.find(
    (p) => p.project_id === project.id && p.name === params.instanceName
  )
  if (!instance) return Err(notFoundErr)

  return Ok(instance)
}

export function lookupNetworkInterface(
  params: NetworkInterfaceParams
): Result<Json<Api.NetworkInterface>> {
  const [instance, err] = lookupInstance(params)
  if (err) return Err(err)

  const nic = db.networkInterfaces.find(
    (n) => n.instance_id === instance.id && n.name === params.interfaceName
  )
  if (!nic) return Err(notFoundErr)

  return Ok(nic)
}

export function lookupDisk(params: DiskParams): Result<Json<Api.Disk>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const disk = db.disks.find(
    (d) => d.project_id === project.id && d.name === params.diskName
  )
  if (!disk) return Err(notFoundErr)

  return Ok(disk)
}

export function lookupVpcSubnet(params: VpcSubnetParams): Result<Json<Api.VpcSubnet>> {
  const [vpc, err] = lookupVpc(params)
  if (err) return Err(err)

  const subnet = db.vpcSubnets.find(
    (p) => p.vpc_id === vpc.id && p.name === params.subnetName
  )
  if (!subnet) return Err(notFoundErr)

  return Ok(subnet)
}

export function lookupVpcRouter(params: VpcRouterParams): Result<Json<Api.VpcRouter>> {
  const [vpc, err] = lookupVpc(params)
  if (err) return Err(err)

  const router = db.vpcRouters.find(
    (r) => r.vpc_id === vpc.id && r.name === params.routerName
  )
  if (!router) return Err(notFoundErr)

  return Ok(router)
}

const initDb = {
  disks: [...mock.disks],
  images: [...mock.images],
  instances: [mock.instance],
  networkInterfaces: [mock.networkInterface],
  orgs: [mock.org],
  projects: [mock.project],
  snapshots: [...mock.snapshots],
  sshKeys: [...mock.sshKeys],
  vpcFirewallRules: [...mock.defaultFirewallRules],
  vpcRouterRoutes: [mock.vpcRouterRoute],
  vpcRouters: [mock.vpcRouter],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
}

const clone = (o: unknown) => JSON.parse(JSON.stringify(o))

export function resetDb() {
  db = clone(initDb)
}

export let db: typeof initDb = clone(initDb)
