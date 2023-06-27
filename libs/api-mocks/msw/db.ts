// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
import { validate as isUuid } from 'uuid'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import { user1 } from '@oxide/api-mocks'
import { exclude } from '@oxide/util'

import type { Json } from '../json-type'
import { clone, json } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = json({ error_code: 'ObjectNotFound' } as const, { status: 404 })
export const invalidSelectorErr = json({ error_code: 'InvalidSelector' } as const, {
  status: 400,
})

const validateSelector = <S extends Record<string, unknown>, K extends keyof S>(
  selector: S,
  primaryField: K
) => {
  if (!selector[primaryField]) throw notFoundErr
  if (
    isUuid(selector[primaryField] as string) &&
    Object.values(exclude(selector, primaryField)).reduce(
      (acc, val) => acc && val === undefined,
      true
    )
  ) {
    throw invalidSelectorErr
  }
  return selector as Omit<S, K> & Record<K, string>
}

export const lookupById = <T extends { id: string }>(table: T[], id: string) => {
  const item = table.find((i) => i.id === id)
  if (!item) throw notFoundErr
  return item
}

export const lookup = {
  project(selector: PP.Project): Json<Api.Project> {
    const { project: id } = validateSelector(selector, 'project')

    if (isUuid(id)) return lookupById(db.projects, id)

    const project = db.projects.find((p) => p.name === id)
    if (!project) throw notFoundErr

    return project
  },
  instance(selector: PP.Instance): Json<Api.Instance> {
    const { instance: id, ...projectSelector } = validateSelector(selector, 'instance')

    if (isUuid(id)) return lookupById(db.instances, id)

    const project = lookup.project(projectSelector)
    const instance = db.instances.find((i) => i.project_id === project.id && i.name === id)
    if (!instance) throw notFoundErr

    return instance
  },
  networkInterface(selector: PP.NetworkInterface): Json<Api.InstanceNetworkInterface> {
    const { interface: id, ...instanceSelector } = validateSelector(selector, 'interface')

    if (isUuid(id)) return lookupById(db.networkInterfaces, id)

    const instance = lookup.instance(instanceSelector)

    const nic = db.networkInterfaces.find(
      (n) => n.instance_id === instance.id && n.name === id
    )
    if (!nic) throw notFoundErr

    return nic
  },
  disk(selector: PP.Disk): Json<Api.Disk> {
    const { disk: id, ...projectSelector } = validateSelector(selector, 'disk')

    if (isUuid(id)) return lookupById(db.disks, id)

    const project = lookup.project(projectSelector)

    const disk = db.disks.find((d) => d.project_id === project.id && d.name === id)
    if (!disk) throw notFoundErr

    return disk
  },
  snapshot(selector: PP.Snapshot): Json<Api.Snapshot> {
    const { snapshot: id, ...projectSelector } = validateSelector(selector, 'snapshot')

    if (isUuid(id)) return lookupById(db.snapshots, id)

    const project = lookup.project(projectSelector)
    const snapshot = db.snapshots.find((i) => i.project_id === project.id && i.name === id)
    if (!snapshot) throw notFoundErr

    return snapshot
  },
  vpc(selector: PP.Vpc): Json<Api.Vpc> {
    const { vpc: id, ...projectSelector } = validateSelector(selector, 'vpc')

    if (isUuid(id)) return lookupById(db.vpcs, id)

    const project = lookup.project(projectSelector)
    const vpc = db.vpcs.find((v) => v.project_id === project.id && v.name === id)
    if (!vpc) throw notFoundErr

    return vpc
  },
  vpcRouter(selector: PP.VpcRouter): Json<Api.VpcRouter> {
    const { router: id, ...vpcSelector } = validateSelector(selector, 'router')

    if (isUuid(id)) return lookupById(db.vpcRouters, id)

    const vpc = lookup.vpc(vpcSelector)
    const router = db.vpcRouters.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!router) throw notFoundErr

    return router
  },
  vpcRouterRoute(selector: PP.RouterRoute): Json<Api.RouterRoute> {
    const { route: id, ...routerSelector } = validateSelector(selector, 'route')

    if (isUuid(id)) return lookupById(db.vpcRouterRoutes, id)

    const router = lookup.vpcRouter(routerSelector)
    const route = db.vpcRouterRoutes.find(
      (s) => s.vpc_router_id === router.id && s.name === id
    )
    if (!route) throw notFoundErr

    return route
  },
  vpcSubnet(selector: PP.VpcSubnet): Json<Api.VpcSubnet> {
    const { subnet: id, ...vpcSelector } = validateSelector(selector, 'subnet')

    if (isUuid(id)) return lookupById(db.vpcSubnets, id)

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr

    return subnet
  },
  image(selector: PP.Image): Json<Api.Image> {
    const { image: id, project: projectSelector } = validateSelector(selector, 'image')

    if (isUuid(id)) return lookupById(db.images, id)

    let image: Json<Api.Image> | undefined
    if (projectSelector === undefined) {
      // silo image
      image = db.images.find((d) => d.project_id === undefined && d.name === id)
    } else {
      // project image
      const project = lookup.project({ project: projectSelector })
      image = db.images.find((d) => d.project_id === project.id && d.name === id)
    }

    if (!image) throw notFoundErr
    return image
  },
  samlIdp(selector: PP.IdentityProvider): Json<Api.SamlIdentityProvider> {
    const { provider: id, ...siloSelector } = validateSelector(selector, 'provider')

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
  sled({ sledId: id }: PP.Sled): Json<Api.Sled> {
    if (!id) throw notFoundErr

    return lookupById(db.sleds, id)
  },
  systemUpdate({ version }: PP.SystemUpdate): Json<Api.SystemUpdate> {
    const update = db.systemUpdates.find((o) => o.version === version)
    if (!update) throw notFoundErr
    return update
  },
  sshKey({ sshKey: id }: PP.SshKey): Json<Api.SshKey> {
    // we don't have a concept of mock session. assume the user is user1
    const userSshKeys = db.sshKeys.filter((key) => key.silo_user_id === user1.id)

    if (isUuid(id)) return lookupById(userSshKeys, id)

    const sshKey = userSshKeys.find((key) => key.name === id)
    if (!sshKey) throw notFoundErr
    return sshKey
  },
}

/** Track the upload state of an imported image */
type DiskBulkImport = {
  // for now, each block (keyed by offset) just tracks the fact that it was
  // uploaded. we might want to store more about it in the future
  blocks: Record<number, boolean>
}

const initDb = {
  disks: [...mock.disks],
  diskBulkImportState: {} as Record<string, DiskBulkImport>,
  userGroups: [...mock.userGroups],
  /** Join table for `users` and `userGroups` */
  groupMemberships: [...mock.groupMemberships],
  images: [...mock.images],
  instances: [mock.instance],
  networkInterfaces: [mock.networkInterface],
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
