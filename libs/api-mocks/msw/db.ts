// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
import { validate as isUuid } from 'uuid'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api, PathParams as PP, PathParamsV1 as PPv1 } from '@oxide/api'
import { user1 } from '@oxide/api-mocks'

import type { Json } from '../json-type'
import { clone, json } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = json({ error_code: 'ObjectNotFound' } as const, { status: 404 })

export const lookupById = <T extends { id: string }>(table: T[], id: string) => {
  const item = table.find((i) => i.id === id)
  if (!item) throw notFoundErr
  return item
}

export const lookup = {
  org({ organization: id }: PPv1.Org): Json<Api.Organization> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.orgs, id)

    const org = db.orgs.find((o) => o.name === id)
    if (!org) throw notFoundErr

    return org
  },
  project({ project: id, ...orgSelector }: PPv1.Project): Json<Api.Project> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.projects, id)

    const org = lookup.org(orgSelector)
    const project = db.projects.find((p) => p.organization_id === org.id && p.name === id)
    if (!project) throw notFoundErr

    return project
  },
  instance({ instance: id, ...projectSelector }: PPv1.Instance): Json<Api.Instance> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.instances, id)

    const project = lookup.project(projectSelector)
    const instance = db.instances.find((i) => i.project_id === project.id && i.name === id)
    if (!instance) throw notFoundErr

    return instance
  },
  networkInterface({
    interface: id,
    ...instanceSelector
  }: PPv1.NetworkInterface): Json<Api.NetworkInterface> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.networkInterfaces, id)

    const instance = lookup.instance(instanceSelector)

    const nic = db.networkInterfaces.find(
      (n) => n.instance_id === instance.id && n.name === id
    )
    if (!nic) throw notFoundErr

    return nic
  },
  disk({ disk: id, ...projectSelector }: PPv1.Disk): Json<Api.Disk> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.disks, id)

    const project = lookup.project(projectSelector)

    const disk = db.disks.find((d) => d.project_id === project.id && d.name === id)
    if (!disk) throw notFoundErr

    return disk
  },
  snapshot({ snapshot: id, ...projectSelector }: PPv1.Snapshot): Json<Api.Snapshot> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.snapshots, id)

    const project = lookup.project(projectSelector)
    const snapshot = db.snapshots.find((i) => i.project_id === project.id && i.name === id)
    if (!snapshot) throw notFoundErr

    return snapshot
  },
  vpc({ vpc: id, ...projectSelector }: PPv1.Vpc): Json<Api.Vpc> {
    console.log({ id, ...projectSelector })
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcs, id)

    const project = lookup.project(projectSelector)
    const vpc = db.vpcs.find((v) => v.project_id === project.id && v.name === id)
    if (!vpc) throw notFoundErr

    return vpc
  },
  vpcRouter({ router: id, ...vpcSelector }: PPv1.VpcRouter): Json<Api.VpcRouter> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcRouters, id)

    const vpc = lookup.vpc(vpcSelector)
    const router = db.vpcRouters.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!router) throw notFoundErr

    return router
  },
  vpcSubnet({ subnet: id, ...vpcSelector }: PPv1.VpcSubnet): Json<Api.VpcSubnet> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcSubnets, id)

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr

    return subnet
  },
  systemUpdate({ version }: PPv1.SystemUpdate): Json<Api.SystemUpdate> {
    const update = db.systemUpdates.find((o) => o.version === version)
    if (!update) throw notFoundErr
    return update
  },
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

export function lookupImage(params: PP.Image): Json<Api.Image> {
  const project = lookupProject(params)

  const image = db.images.find(
    (d) => d.project_id === project.id && d.name === params.imageName
  )
  if (!image) throw notFoundErr

  return image
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

export function lookupSled(params: PP.Id): Json<Api.Sled> {
  const sled = db.sleds.find((sled) => sled.id === params.id)
  if (!sled) throw notFoundErr
  return sled
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
  physicalDisks: [...mock.physicalDisks],
  projects: [...mock.projects],
  racks: [...mock.racks],
  roleAssignments: [...mock.roleAssignments],
  /** Join table for `silos` and `identityProviders` */
  silos: [...mock.silos],
  identityProviders: [...mock.identityProviders],
  sleds: [...mock.sleds],
  snapshots: [...mock.snapshots],
  sshKeys: [...mock.sshKeys],
  componentUpdates: [...mock.componentUpdates],
  systemUpdates: [...mock.systemUpdates],
  systemUpdateComponentUpdates: [...mock.systemUpdateComponentUpdates],
  updateableComponents: [...mock.updateableComponents],
  updateDeployments: [...mock.updateDeployments],
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
