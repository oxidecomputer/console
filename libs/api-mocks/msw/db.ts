import { response } from 'msw'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import { sessionMe } from '@oxide/api-mocks'

import type { Json } from '../json-type'
import { clone, json } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = json({ error_code: 'ObjectNotFound' } as const, { status: 404 })

type Ok<T> = [T, null]
type LookupError = typeof notFoundErr // Lookups can only 404
type Err = [null, LookupError]
type Result<T> = Ok<T> | Err

// imitate Rust's Result constructors
const Ok = <T>(o: T): Ok<T> => [o, null]
const Err = (err: LookupError): Err => [null, err]

export const lookupById =
  <T extends { id: string }>(table: T[]) =>
  (req: { params: { id: string } }) => {
    const item = table.find((i) => i.id === req.params.id) || notFoundErr
    return response(item ? json(item) : notFoundErr)
  }

export function lookupOrg(params: PP.Org): Result<Json<Api.Organization>> {
  const org = db.orgs.find((o) => o.name === params.orgName)
  if (!org) return Err(notFoundErr)
  return Ok(org)
}

export function lookupProject(params: PP.Project): Result<Json<Api.Project>> {
  const [org, err] = lookupOrg(params)
  if (err) return Err(err)

  const project = db.projects.find(
    (p) => p.organization_id === org.id && p.name === params.projectName
  )
  if (!project) return Err(notFoundErr)

  return Ok(project)
}

export function lookupVpc(params: PP.Vpc): Result<Json<Api.Vpc>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const vpc = db.vpcs.find((p) => p.project_id === project.id && p.name === params.vpcName)

  if (!vpc) return Err(notFoundErr)

  return Ok(vpc)
}

export function lookupInstance(params: PP.Instance): Result<Json<Api.Instance>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const instance = db.instances.find(
    (p) => p.project_id === project.id && p.name === params.instanceName
  )
  if (!instance) return Err(notFoundErr)

  return Ok(instance)
}

export function lookupNetworkInterface(
  params: PP.NetworkInterface
): Result<Json<Api.NetworkInterface>> {
  const [instance, err] = lookupInstance(params)
  if (err) return Err(err)

  const nic = db.networkInterfaces.find(
    (n) => n.instance_id === instance.id && n.name === params.interfaceName
  )
  if (!nic) return Err(notFoundErr)

  return Ok(nic)
}

export function lookupDisk(params: PP.Disk): Result<Json<Api.Disk>> {
  const [project, err] = lookupProject(params)
  if (err) return Err(err)

  const disk = db.disks.find(
    (d) => d.project_id === project.id && d.name === params.diskName
  )
  if (!disk) return Err(notFoundErr)

  return Ok(disk)
}

export function lookupVpcSubnet(params: PP.VpcSubnet): Result<Json<Api.VpcSubnet>> {
  const [vpc, err] = lookupVpc(params)
  if (err) return Err(err)

  const subnet = db.vpcSubnets.find(
    (p) => p.vpc_id === vpc.id && p.name === params.subnetName
  )
  if (!subnet) return Err(notFoundErr)

  return Ok(subnet)
}

export function lookupVpcRouter(params: PP.VpcRouter): Result<Json<Api.VpcRouter>> {
  const [vpc, err] = lookupVpc(params)
  if (err) return Err(err)

  const router = db.vpcRouters.find(
    (r) => r.vpc_id === vpc.id && r.name === params.routerName
  )
  if (!router) return Err(notFoundErr)

  return Ok(router)
}

export function lookupGlobalImage(params: PP.GlobalImage): Result<Json<Api.GlobalImage>> {
  const image = db.globalImages.find((o) => o.name === params.imageName)
  if (!image) return Err(notFoundErr)
  return Ok(image)
}

export function lookupSilo(params: PP.Silo): Result<Json<Api.Silo>> {
  const silo = db.silos.find((o) => o.name === params.siloName)
  if (!silo) return Err(notFoundErr)
  return Ok(silo)
}

export function lookupSshKey(params: PP.SshKey): Result<Json<Api.SshKey>> {
  const sshKey = db.sshKeys.find(
    (key) => key.name === params.sshKeyName && key.silo_user_id === sessionMe.id
  )
  if (!sshKey) return Err(notFoundErr)
  return Ok(sshKey)
}

const initDb = {
  disks: [...mock.disks],
  globalImages: [...mock.globalImages],
  images: [...mock.images],
  instances: [mock.instance],
  networkInterfaces: [mock.networkInterface],
  orgs: [...mock.orgs],
  projects: [...mock.projects],
  roleAssignments: [...mock.roleAssignments],
  silos: [...mock.silos],
  snapshots: [...mock.snapshots],
  sshKeys: [...mock.sshKeys],
  users: [...mock.users],
  vpcFirewallRules: [...mock.defaultFirewallRules],
  vpcRouterRoutes: [mock.vpcRouterRoute],
  vpcRouters: [mock.vpcRouter],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
}

export let db = clone(initDb)

export function resetDb() {
  db = clone(initDb)
}
