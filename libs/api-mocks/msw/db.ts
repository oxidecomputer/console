import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import { user1 } from '@oxide/api-mocks'

import type { Json } from '../json-type'
import { clone, json } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = json({ error_code: 'ObjectNotFound' } as const, { status: 404 })

export const lookupById =
  <T extends { id: string }>(table: T[]) =>
  (params: { path: PP.Id }) => {
    const item = table.find((i) => i.id === params.path.id)
    if (!item) throw notFoundErr
    return item
  }

export function lookupOrg(params: PP.Org): Json<Api.Organization> {
  const org = db.orgs.find((o) => o.name === params.orgName)
  if (!org) throw notFoundErr
  return org
}

export function lookupProject(params: PP.Project): Json<Api.Project> {
  const org = lookupOrg(params)

  const project = db.projects.find(
    (p) => p.organization_id === org.id && p.name === params.projectName
  )
  if (!project) throw notFoundErr

  return project
}

export function lookupVpc(params: PP.Vpc): Json<Api.Vpc> {
  const project = lookupProject(params)

  const vpc = db.vpcs.find((p) => p.project_id === project.id && p.name === params.vpcName)
  if (!vpc) throw notFoundErr

  return vpc
}

export function lookupInstance(params: PP.Instance): Json<Api.Instance> {
  const project = lookupProject(params)

  const instance = db.instances.find(
    (p) => p.project_id === project.id && p.name === params.instanceName
  )
  if (!instance) throw notFoundErr

  return instance
}

export function lookupNetworkInterface(
  params: PP.NetworkInterface
): Json<Api.NetworkInterface> {
  const instance = lookupInstance(params)

  const nic = db.networkInterfaces.find(
    (n) => n.instance_id === instance.id && n.name === params.interfaceName
  )
  if (!nic) throw notFoundErr

  return nic
}

export function lookupDisk(params: PP.Disk): Json<Api.Disk> {
  const project = lookupProject(params)

  const disk = db.disks.find(
    (d) => d.project_id === project.id && d.name === params.diskName
  )
  if (!disk) throw notFoundErr

  return disk
}

export function lookupImage(params: PP.Image): Json<Api.Image> {
  const project = lookupProject(params)

  const image = db.images.find(
    (d) => d.project_id === project.id && d.name === params.imageName
  )
  if (!image) throw notFoundErr

  return image
}

export function lookupSnapshot(params: PP.Snapshot): Json<Api.Snapshot> {
  const project = lookupProject(params)

  const snapshot = db.snapshots.find(
    (s) => s.project_id === project.id && s.name === params.snapshotName
  )
  if (!snapshot) throw notFoundErr

  return snapshot
}

export function lookupVpcSubnet(params: PP.VpcSubnet): Json<Api.VpcSubnet> {
  const vpc = lookupVpc(params)

  const subnet = db.vpcSubnets.find(
    (p) => p.vpc_id === vpc.id && p.name === params.subnetName
  )
  if (!subnet) throw notFoundErr

  return subnet
}

export function lookupVpcRouter(params: PP.VpcRouter): Json<Api.VpcRouter> {
  const vpc = lookupVpc(params)

  const router = db.vpcRouters.find(
    (r) => r.vpc_id === vpc.id && r.name === params.routerName
  )
  if (!router) throw notFoundErr

  return router
}

export function lookupVpcRouterRoute(params: PP.VpcRouterRoute): Json<Api.RouterRoute> {
  const router = lookupVpcRouter(params)

  const route = db.vpcRouterRoutes.find(
    (r) => r.vpc_router_id === router.id && r.name === params.routeName
  )
  if (!route) throw notFoundErr

  return route
}

export function lookupGlobalImage(params: PP.GlobalImage): Json<Api.GlobalImage> {
  const image = db.globalImages.find((o) => o.name === params.imageName)
  if (!image) throw notFoundErr
  return image
}

export function lookupSilo(params: PP.Silo): Json<Api.Silo> {
  const silo = db.silos.find((o) => o.name === params.siloName)
  if (!silo) throw notFoundErr
  return silo
}

export function lookupSamlIdp(params: PP.IdentityProvider): Json<Api.SamlIdentityProvider> {
  const silo = lookupSilo(params)

  const dbIdp = db.identityProviders.find(
    ({ type, siloId, provider }) =>
      type === 'saml' && siloId === silo.id && provider.name === params.providerName
  )

  if (!dbIdp) throw notFoundErr

  return dbIdp.provider
}

export function lookupSshKey(params: PP.SshKey): Json<Api.SshKey> {
  const sshKey = db.sshKeys.find(
    (key) => key.name === params.sshKeyName && key.silo_user_id === user1.id
  )
  if (!sshKey) throw notFoundErr
  return sshKey
}

const initDb = {
  disks: [...mock.disks],
  globalImages: [...mock.globalImages],
  userGroups: [...mock.userGroups],
  /** Join table for `users` and `userGroups` */
  groupMemberships: [...mock.groupMemberships],
  images: [...mock.images],
  instances: [mock.instance],
  networkInterfaces: [mock.networkInterface],
  orgs: [...mock.orgs],
  projects: [...mock.projects],
  roleAssignments: [...mock.roleAssignments],
  /** Join table for `silos` and `identityProviders` */
  silos: [...mock.silos],
  identityProviders: [...mock.identityProviders],
  snapshots: [...mock.snapshots],
  sshKeys: [...mock.sshKeys],
  systemUpdates: [...mock.systemUpdates],
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
