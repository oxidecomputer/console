/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
// note that isUuid checks for any kind of UUID. strictly speaking, we should
// only be checking for v4
import { validate as isUuid } from 'uuid'

import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import * as mock from '@oxide/api-mocks'

import { json } from '~/api/__generated__/msw-handlers'
import { pick } from '~/util/object'

import type { Json } from '../json-type'
import { internalError } from './util'

const notFoundBody = { error_code: 'ObjectNotFound' } as const
export type NotFound = typeof notFoundBody
export const notFoundErr = (msg?: string) => {
  const message = msg ? `not found: ${msg}` : 'not found'
  return json({ error_code: 'ObjectNotFound', message } as const, { status: 404 })
}

export const lookupById = <T extends { id: string }>(table: T[], id: string) => {
  const item = table.find((i) => i.id === id)
  if (!item) throw notFoundErr
  return item
}

export const lookup = {
  project({ project: id }: PP.Project): Json<Api.Project> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.projects, id)

    const project = db.projects.find((p) => p.name === id)
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
  }: PP.NetworkInterface): Json<Api.InstanceNetworkInterface> {
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
  floatingIp({ floatingIp: id, ...projectSelector }: PP.FloatingIp): Json<Api.FloatingIp> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.floatingIps, id)

    const project = lookup.project(projectSelector)
    const floatingIp = db.floatingIps.find(
      (i) => i.project_id === project.id && i.name === id
    )
    if (!floatingIp) throw notFoundErr

    return floatingIp
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
  vpcSubnet({ subnet: id, ...vpcSelector }: PP.VpcSubnet): Json<Api.VpcSubnet> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.vpcSubnets, id)

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr

    return subnet
  },
  image({ image: id, project: projectId }: PP.Image): Json<Api.Image> {
    if (!id) throw notFoundErr

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

    if (!image) throw notFoundErr
    return image
  },
  ipPool({ pool: id }: PP.IpPool): Json<Api.IpPool> {
    if (!id) throw notFoundErr

    if (isUuid(id)) return lookupById(db.ipPools, id)

    const pool = db.ipPools.find((p) => p.name === id)
    if (!pool) throw notFoundErr

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
    if (!ipPoolSilo) throw notFoundErr

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
  sled({ sledId: id }: PP.Sled): Json<Api.Sled> {
    if (!id) throw notFoundErr

    return lookupById(db.sleds, id)
  },
  sshKey({ sshKey: id }: PP.SshKey): Json<Api.SshKey> {
    // we don't have a concept of mock session. assume the user is user1
    const userSshKeys = db.sshKeys.filter((key) => key.silo_user_id === mock.user1.id)

    if (isUuid(id)) return lookupById(userSshKeys, id)

    const sshKey = userSshKeys.find((key) => key.name === id)
    if (!sshKey) throw notFoundErr
    return sshKey
  },
}

export function utilizationForSilo(silo: Json<Api.Silo>) {
  const quotas = db.siloQuotas.find((q) => q.silo_id === silo.id)
  if (!quotas) throw internalError()

  const provisioned = db.siloProvisioned.find((p) => p.silo_id === silo.id)
  if (!provisioned) throw internalError()

  return {
    allocated: pick(quotas, 'cpus', 'storage', 'memory'),
    provisioned: pick(provisioned, 'cpus', 'storage', 'memory'),
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
  vpcFirewallRules: [...mock.defaultFirewallRules],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
}

export let db = structuredClone(initDb)

export function resetDb() {
  db = structuredClone(initDb)
}
