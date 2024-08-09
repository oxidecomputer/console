/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
import * as R from 'remeda'
import { validate as isUuid } from 'uuid'

import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import * as mock from '@oxide/api-mocks'

import { json } from '~/api/__generated__/msw-handlers'
import { commaSeries } from '~/util/str'

import type { Json } from '../json-type'
import { internalError } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = (msg: string) => {
  const message = `not found: ${msg}`
  return json({ error_code: 'ObjectNotFound', message } as const, { status: 404 })
}

export const badSelectorErr = (resource: string, parents: string[]) => {
  const message = `when ${resource} is specified by ID, ${commaSeries(parents, 'and')} should not be specified`
  return json({ error_code: 'InvalidRequest', message }, { status: 400 })
}

export const lookupById = <T extends { id: string }>(table: T[], id: string) => {
  const item = table.find((i) => i.id === id)
  if (!item) throw notFoundErr(`by id ${id}`)
  return item
}

export const getIpFromPool = (poolName: string | undefined) => {
  const pool = lookup.ipPool({ pool: poolName })
  const ipPoolRange = db.ipPoolRanges.find((range) => range.ip_pool_id === pool.id)
  if (!ipPoolRange) throw notFoundErr(`IP range for pool '${poolName}'`)

  // right now, we're just using the first address in the range, but we'll
  // want to filter the list of available IPs for the first unused address
  // also: think through how calling code might want to handle various issues
  // and what appropriate error codes would be: no ranges? pool is exhausted? etc.
  return ipPoolRange.range.first
}

export const lookup = {
  project({ project: id }: PP.Project): Json<Api.Project> {
    if (!id) throw notFoundErr('no project specified')

    if (isUuid(id)) return lookupById(db.projects, id)

    const project = db.projects.find((p) => p.name === id)
    if (!project) throw notFoundErr(`project '${id}'`)

    return project
  },
  instance({ instance: id, ...projectSelector }: PP.Instance): Json<Api.Instance> {
    if (!id) throw notFoundErr('no instance specified')

    if (isUuid(id)) return lookupById(db.instances, id)

    const project = lookup.project(projectSelector)
    const instance = db.instances.find((i) => i.project_id === project.id && i.name === id)
    if (!instance) throw notFoundErr(`instance '${id}'`)

    return instance
  },
  networkInterface({
    interface: id,
    ...instanceSelector
  }: PP.NetworkInterface): Json<Api.InstanceNetworkInterface> {
    if (!id) throw notFoundErr('no NIC specified')

    if (isUuid(id)) return lookupById(db.networkInterfaces, id)

    const instance = lookup.instance(instanceSelector)

    const nic = db.networkInterfaces.find(
      (n) => n.instance_id === instance.id && n.name === id
    )
    if (!nic) throw notFoundErr(`NIC '${id}'`)

    return nic
  },
  disk({ disk: id, ...projectSelector }: PP.Disk): Json<Api.Disk> {
    if (!id) throw notFoundErr('no disk specified')

    if (isUuid(id)) return lookupById(db.disks, id)

    const project = lookup.project(projectSelector)

    const disk = db.disks.find((d) => d.project_id === project.id && d.name === id)
    if (!disk) throw notFoundErr(`disk '${id}'`)

    return disk
  },
  floatingIp({ floatingIp: id, ...projectSelector }: PP.FloatingIp): Json<Api.FloatingIp> {
    if (!id) throw notFoundErr('no floating IP specified')

    if (isUuid(id)) {
      if (projectSelector.project) throw badSelectorErr('floating IP', ['project'])
      return lookupById(db.floatingIps, id)
    }

    const project = lookup.project(projectSelector)
    const floatingIp = db.floatingIps.find(
      (i) => i.project_id === project.id && i.name === id
    )
    if (!floatingIp) throw notFoundErr(`floating IP '${id}'`)

    return floatingIp
  },
  snapshot({ snapshot: id, ...projectSelector }: PP.Snapshot): Json<Api.Snapshot> {
    if (!id) throw notFoundErr('no snapshot specified')

    if (isUuid(id)) return lookupById(db.snapshots, id)

    const project = lookup.project(projectSelector)
    const snapshot = db.snapshots.find((i) => i.project_id === project.id && i.name === id)
    if (!snapshot) throw notFoundErr(`snapshot '${id}'`)

    return snapshot
  },
  vpc({ vpc: id, ...projectSelector }: PP.Vpc): Json<Api.Vpc> {
    if (!id) throw notFoundErr('no VPC specified')

    if (isUuid(id)) return lookupById(db.vpcs, id)

    const project = lookup.project(projectSelector)
    const vpc = db.vpcs.find((v) => v.project_id === project.id && v.name === id)
    if (!vpc) throw notFoundErr(`vpc '${id}'`)

    return vpc
  },
  vpcRouter({ router: id, ...vpcSelector }: PP.VpcRouter): Json<Api.VpcRouter> {
    if (!id) throw notFoundErr('no router specified')

    if (isUuid(id)) return lookupById(db.vpcRouters, id)

    const vpc = lookup.vpc(vpcSelector)
    const router = db.vpcRouters.find((r) => r.vpc_id === vpc.id && r.name === id)
    if (!router) throw notFoundErr(`router '${id}'`)

    return router
  },
  vpcRouterRoute({
    route: id,
    ...routerSelector
  }: PP.VpcRouterRoute): Json<Api.RouterRoute> {
    if (!id) throw notFoundErr('no route specified')

    if (isUuid(id)) return lookupById(db.vpcRouterRoutes, id)

    const router = lookup.vpcRouter(routerSelector)
    const route = db.vpcRouterRoutes.find(
      (r) => r.vpc_router_id === router.id && r.name === id
    )
    if (!route) throw notFoundErr(`route '${id}'`)

    return route
  },
  vpcSubnet({ subnet: id, ...vpcSelector }: PP.VpcSubnet): Json<Api.VpcSubnet> {
    if (!id) throw notFoundErr('no subnet specified')

    if (isUuid(id)) return lookupById(db.vpcSubnets, id)

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr(`subnet '${id}'`)

    return subnet
  },
  image({ image: id, project: projectId }: PP.Image): Json<Api.Image> {
    if (!id) throw notFoundErr('no image specified')

    if (isUuid(id)) return lookupById(db.images, id)

    let image: Json<Api.Image> | undefined
    if (projectId === undefined) {
      // silo image
      image = db.images.find((d) => d.project_id === undefined && d.name === id)
    } else {
      // project image
      const project = lookup.project({ project: projectId })
      image = db.images.find((d) => d.project_id === project.id && d.name === id)
    }

    if (!image) throw notFoundErr(`image '${id}'`)
    return image
  },
  ipPool({ pool: id }: PP.IpPool): Json<Api.IpPool> {
    if (!id) throw notFoundErr('no pool specified')

    if (isUuid(id)) return lookupById(db.ipPools, id)

    const pool = db.ipPools.find((p) => p.name === id)
    if (!pool) throw notFoundErr('IP pool')

    return pool
  },
  // unusual one because it's a sibling relationship. we look up both the pool and the silo first
  ipPoolSiloLink({
    pool: poolId,
    silo: siloId,
  }: PP.IpPool & PP.Silo): Json<Api.IpPoolSiloLink> {
    const pool = lookup.ipPool({ pool: poolId })
    const silo = lookup.silo({ silo: siloId })

    const ipPoolSilo = db.ipPoolSilos.find(
      (ips) => ips.ip_pool_id === pool.id && ips.silo_id === silo.id
    )
    if (!ipPoolSilo) throw notFoundErr(`link for pool '${poolId}' and silo '${siloId}'`)

    return ipPoolSilo
  },
  // unusual because it returns a list, but we need it for multiple endpoints
  siloIpPools(path: PP.Silo): Json<Api.SiloIpPool>[] {
    const silo = lookup.silo(path)

    // effectively join db.ipPools and db.ipPoolSilos on ip_pool_id
    return db.ipPoolSilos
      .filter((link) => link.silo_id === silo.id)
      .map((link) => {
        const pool = db.ipPools.find((pool) => pool.id === link.ip_pool_id)

        // this should never happen
        if (!pool) {
          const linkStr = JSON.stringify(link)
          const message = `Found IP pool-silo link without corresponding pool: ${linkStr}`
          throw json({ message }, { status: 500 })
        }

        return { ...pool, is_default: link.is_default }
      })
  },
  siloIpPool(path: PP.Silo & PP.IpPool): Json<Api.SiloIpPool> {
    const silo = lookup.silo(path)
    const pool = lookup.ipPool(path)

    // we want to 404 if it exists but isn't in the silo
    const ipPoolSilo = db.ipPoolSilos.find(
      (ips) => ips.ip_pool_id === pool.id && ips.silo_id === silo.id
    )
    if (!ipPoolSilo) {
      throw notFoundErr(`link for pool '${path.pool}' and silo '${path.silo}'`)
    }

    return { ...pool, is_default: ipPoolSilo.is_default }
  },
  siloDefaultIpPool(path: PP.Silo): Json<Api.IpPool> {
    const silo = lookup.silo(path)

    const link = db.ipPoolSilos.find((ips) => ips.silo_id === silo.id && ips.is_default)
    if (!link) throw notFoundErr(`default pool for silo '${path.silo}'`)

    return lookupById(db.ipPools, link.ip_pool_id)
  },
  samlIdp({ provider: id, silo }: PP.IdentityProvider): Json<Api.SamlIdentityProvider> {
    if (!id) throw notFoundErr('no IdP specified')

    const dbSilo = lookup.silo({ silo })

    const dbIdp = db.identityProviders.find(
      ({ type, siloId, provider }) =>
        type === 'saml' && siloId === dbSilo.id && provider.name === id
    )

    if (!dbIdp) throw notFoundErr(`IdP '${id}' for silo '${silo}'`)

    return dbIdp.provider
  },
  silo({ silo: id }: PP.Silo): Json<Api.Silo> {
    if (!id) throw notFoundErr('silo not specified')

    if (isUuid(id)) return lookupById(db.silos, id)

    const silo = db.silos.find((o) => o.name === id)
    if (!silo) throw notFoundErr(`silo '${id}'`)
    return silo
  },
  sled({ sledId: id }: PP.Sled): Json<Api.Sled> {
    if (!id) throw notFoundErr('sled not specified')
    return lookupById(db.sleds, id)
  },
  sshKey({ sshKey: id }: PP.SshKey): Json<Api.SshKey> {
    // we don't have a concept of mock session. assume the user is user1
    const userSshKeys = db.sshKeys.filter((key) => key.silo_user_id === mock.user1.id)

    if (isUuid(id)) return lookupById(userSshKeys, id)

    const sshKey = userSshKeys.find((key) => key.name === id)
    if (!sshKey) throw notFoundErr(`SSH key '${id}'`)
    return sshKey
  },
}

export function utilizationForSilo(silo: Json<Api.Silo>) {
  const quotas = db.siloQuotas.find((q) => q.silo_id === silo.id)
  if (!quotas) {
    throw internalError(`no entry in db.siloQuotas for silo ${silo.name}`)
  }

  const provisioned = db.siloProvisioned.find((p) => p.silo_id === silo.id)
  if (!provisioned) {
    throw internalError(`no entry in db.siloProvisioned for silo ${silo.name}`)
  }

  return {
    allocated: R.pick(quotas, ['cpus', 'storage', 'memory']),
    provisioned: R.pick(provisioned, ['cpus', 'storage', 'memory']),
    silo_id: silo.id,
    silo_name: silo.name,
  }
}

/** Track the upload state of an imported image */
type DiskBulkImport = {
  // for now, each block (keyed by offset) just tracks the fact that it was
  // uploaded. we might want to store more about it in the future
  blocks: Record<number, boolean>
}

const initDb = {
  disks: [...mock.disks],
  diskBulkImportState: new Map<string, DiskBulkImport>(),
  floatingIps: [...mock.floatingIps],
  userGroups: [...mock.userGroups],
  /** Join table for `users` and `userGroups` */
  groupMemberships: [...mock.groupMemberships],
  images: [...mock.images],
  ephemeralIps: [...mock.ephemeralIps],
  instances: [...mock.instances],
  ipPools: [...mock.ipPools],
  ipPoolSilos: [...mock.ipPoolSilos],
  ipPoolRanges: [...mock.ipPoolRanges],
  networkInterfaces: [mock.networkInterface],
  physicalDisks: [...mock.physicalDisks],
  projects: [...mock.projects],
  racks: [...mock.racks],
  roleAssignments: [...mock.roleAssignments],
  silos: [...mock.silos],
  siloQuotas: [...mock.siloQuotas],
  siloProvisioned: [...mock.siloProvisioned],
  identityProviders: [...mock.identityProviders],
  sleds: [...mock.sleds],
  snapshots: [...mock.snapshots],
  sshKeys: [...mock.sshKeys],
  users: [...mock.users],
  vpcFirewallRules: [...mock.firewallRules],
  vpcRouters: [...mock.vpcRouters],
  vpcRouterRoutes: [...mock.routerRoutes],
  vpcs: [...mock.vpcs],
  vpcSubnets: [mock.vpcSubnet],
}

export let db = structuredClone(initDb)

export function resetDb() {
  db = structuredClone(initDb)
}
