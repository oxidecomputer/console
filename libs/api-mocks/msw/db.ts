// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
import { validate as isUuid } from 'uuid'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
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
  org({ organization: id }: PP.Org): Json<Api.Organization> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.orgs, id)

    const org = db.orgs.find((o) => o.name === id)
    if (!org) throw notFoundErr

    return org
  },
  project({ project: id, ...orgSelector }: PP.Project): Json<Api.Project> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.projects, id)

    const org = lookup.org(orgSelector)
    const project = db.projects.find((p) => p.organization_id === org.id && p.name === id)
    if (!project) throw notFoundErr

    return project
  },
  instance({ instance: id, ...projectSelector }: PP.Instance): Json<Api.Instance> {
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
  }: PP.NetworkInterface): Json<Api.NetworkInterface> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.networkInterfaces, id)

    const instance = lookup.instance(instanceSelector)

    const nic = db.networkInterfaces.find(
      (n) => n.instance_id === instance.id && n.name === id
    )
    if (!nic) throw notFoundErr

    return nic
  },
  disk({ disk: id, ...projectSelector }: PP.Disk): Json<Api.Disk> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.disks, id)

    const project = lookup.project(projectSelector)

    const disk = db.disks.find((d) => d.project_id === project.id && d.name === id)
    if (!disk) throw notFoundErr

    return disk
  },
  snapshot({ snapshot: id, ...projectSelector }: PP.Snapshot): Json<Api.Snapshot> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.snapshots, id)

    const project = lookup.project(projectSelector)
    const snapshot = db.snapshots.find((i) => i.project_id === project.id && i.name === id)
    if (!snapshot) throw notFoundErr

    return snapshot
  },
  vpc({ vpc: id, ...projectSelector }: PP.Vpc): Json<Api.Vpc> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcs, id)

    const project = lookup.project(projectSelector)
    const vpc = db.vpcs.find((v) => v.project_id === project.id && v.name === id)
    if (!vpc) throw notFoundErr

    return vpc
  },
  vpcRouter({ router: id, ...vpcSelector }: PP.VpcRouter): Json<Api.VpcRouter> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcRouters, id)

    const vpc = lookup.vpc(vpcSelector)
    const router = db.vpcRouters.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!router) throw notFoundErr

    return router
  },
  vpcRouterRoute({ route: id, ...routerSelector }: PP.RouterRoute): Json<Api.RouterRoute> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcRouterRoutes, id)

    const router = lookup.vpcRouter(routerSelector)
    const route = db.vpcRouterRoutes.find(
      (s) => s.vpc_router_id === router.id && s.name === id
    )
    if (!route) throw notFoundErr

    return route
  },
  vpcSubnet({ subnet: id, ...vpcSelector }: PP.VpcSubnet): Json<Api.VpcSubnet> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcSubnets, id)

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr

    return subnet
  },
  image({ image: id, ...projectSelector }: PP.Image): Json<Api.Image> {
    if (!id) throw notFoundErr

    const project = lookup.project(projectSelector)

    if (isUuid(id)) return lookupById(db.images, id)

    const image = db.images.find((d) => d.project_id === project.id && d.name === id)
    if (!image) throw notFoundErr

    return image
  },
  samlIdp({
    provider: id,
    ...siloSelector
  }: PP.IdentityProvider): Json<Api.SamlIdentityProvider> {
    if (!id) throw notFoundErr

    const silo = lookup.silo(siloSelector)

    const dbIdp = db.identityProviders.find(
      ({ type, siloId, provider }) =>
        type === 'saml' && siloId === silo.id && provider.name === id
    )

    if (!dbIdp) throw notFoundErr

    return dbIdp.provider
  },
  silo({ silo: id }: PP.Silo): Json<Api.Silo> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.silos, id)

    const silo = db.silos.find((o) => o.name === id)
    if (!silo) throw notFoundErr
    return silo
  },
  systemUpdate({ version }: PP.SystemUpdate): Json<Api.SystemUpdate> {
    const update = db.systemUpdates.find((o) => o.version === version)
    if (!update) throw notFoundErr
    return update
  },
  sled(params: PP.Id): Json<Api.Sled> {
    const sled = db.sleds.find((sled) => sled.id === params.id)
    if (!sled) throw notFoundErr
    return sled
  },
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
