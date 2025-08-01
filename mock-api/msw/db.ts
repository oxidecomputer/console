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

import type { ApiTypes as Api } from '@oxide/api'
import * as mock from '@oxide/api-mocks'

import { json } from '~/api/__generated__/msw-handlers'
import type * as Sel from '~/api/selectors'
import { commaSeries } from '~/util/str'

import type { Json } from '../json-type'
import { defaultSilo, siloSettings } from '../silo'
import { internalError } from './util'

export const notFoundErr = (msg: string) => {
  const message = `not found: ${msg}`
  return json({ error_code: 'ObjectNotFound', message } as const, { status: 404 })
}

export const lookupById = <T extends { id: string }>(table: T[], id: string) => {
  const item = table.find((i) => i.id === id)
  if (!item) throw notFoundErr(`by id ${id}`)
  return item
}

const paginationParams = ['limit', 'page_token', 'sort_by']

/**
 * Given an object representing (potentially) parent selectors for a resource,
 * throw an error if any of the keys in that object have truthy values. For
 * example, if selecting an instance by ID, we would pass in an object with
 * `project` as the key and error out if and only if `parentSelector.project`
 * is present.
 */
function ensureNoParentSelectors(
  /** Resource name to be used in error message */
  resourceLabel: string,
  parentSelector: Record<string, string | undefined>
) {
  const keysWithValues = Object.entries(parentSelector)
    .filter(([k, v]) => v && !paginationParams.includes(k))
    .map(([k]) => k)
  if (keysWithValues.length > 0) {
    const message = `when ${resourceLabel} is specified by ID, ${commaSeries(keysWithValues, 'and')} should not be specified`
    throw json({ error_code: 'InvalidRequest', message }, { status: 400 })
  }
}

/**
 * If pool name or ID is given, look it up. Otherwise use silo default pool,
 * (and error if the silo doesn't have one).
 */
export const resolveIpPool = (pool: string | undefined | null) =>
  pool ? lookup.ipPool({ pool }) : lookup.siloDefaultIpPool({ silo: defaultSilo.id })

export const getIpFromPool = (pool: Json<Api.IpPool>) => {
  const ipPoolRange = db.ipPoolRanges.find((range) => range.ip_pool_id === pool.id)
  if (!ipPoolRange) throw notFoundErr(`IP range for pool '${pool.name}'`)

  // right now, we're just using the first address in the range, but we'll
  // want to filter the list of available IPs for the first unused address
  // also: think through how calling code might want to handle various issues
  // and what appropriate error codes would be: no ranges? pool is exhausted? etc.
  return ipPoolRange.range.first
}

export const lookup = {
  affinityGroup({
    affinityGroup: id,
    ...projectSelector
  }: Sel.AffinityGroup): Json<Api.AffinityGroup> {
    if (!id) throw notFoundErr('no affinity group specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('affinity group', projectSelector)
      return lookupById(db.affinityGroups, id)
    }

    const project = lookup.project(projectSelector)
    const affinityGroup = db.affinityGroups.find(
      (a) => a.project_id === project.id && a.name === id
    )
    if (!affinityGroup) throw notFoundErr(`affinity group '${id}'`)
    return affinityGroup
  },
  antiAffinityGroup({
    antiAffinityGroup: id,
    ...projectSelector
  }: Sel.AntiAffinityGroup): Json<Api.AntiAffinityGroup> {
    if (!id) throw notFoundErr('no anti-affinity group specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('anti-affinity group', projectSelector)
      return lookupById(db.antiAffinityGroups, id)
    }

    const project = lookup.project(projectSelector)
    const antiAffinityGroup = db.antiAffinityGroups.find(
      (a) => a.project_id === project.id && a.name === id
    )
    if (!antiAffinityGroup) throw notFoundErr(`anti-affinity group '${id}'`)
    return antiAffinityGroup
  },
  project({ project: id }: Sel.Project): Json<Api.Project> {
    if (!id) throw notFoundErr('no project specified')

    if (isUuid(id)) return lookupById(db.projects, id)

    const project = db.projects.find((p) => p.name === id)
    if (!project) throw notFoundErr(`project '${id}'`)

    return project
  },
  instance({ instance: id, ...projectSelector }: Sel.Instance): Json<Api.Instance> {
    if (!id) throw notFoundErr('no instance specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('instance', projectSelector)
      return lookupById(db.instances, id)
    }

    const project = lookup.project(projectSelector)
    const instance = db.instances.find((i) => i.project_id === project.id && i.name === id)
    if (!instance) throw notFoundErr(`instance '${id}'`)

    return instance
  },
  networkInterface({
    interface: id,
    ...instanceSelector
  }: Sel.NetworkInterface): Json<Api.InstanceNetworkInterface> {
    if (!id) throw notFoundErr('no NIC specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('network interface', instanceSelector)
      return lookupById(db.networkInterfaces, id)
    }

    const instance = lookup.instance(instanceSelector)

    const nic = db.networkInterfaces.find(
      (n) => n.instance_id === instance.id && n.name === id
    )
    if (!nic) throw notFoundErr(`NIC '${id}'`)

    return nic
  },
  disk({ disk: id, ...projectSelector }: Sel.Disk): Json<Api.Disk> {
    if (!id) throw notFoundErr('no disk specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('disk', projectSelector)
      return lookupById(db.disks, id)
    }

    const project = lookup.project(projectSelector)

    const disk = db.disks.find((d) => d.project_id === project.id && d.name === id)
    if (!disk) throw notFoundErr(`disk '${id}'`)

    return disk
  },
  floatingIp({ floatingIp: id, ...projectSelector }: Sel.FloatingIp): Json<Api.FloatingIp> {
    if (!id) throw notFoundErr('no floating IP specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('floating IP', projectSelector)
      return lookupById(db.floatingIps, id)
    }

    const project = lookup.project(projectSelector)
    const floatingIp = db.floatingIps.find(
      (i) => i.project_id === project.id && i.name === id
    )
    if (!floatingIp) throw notFoundErr(`floating IP '${id}'`)

    return floatingIp
  },
  snapshot({ snapshot: id, ...projectSelector }: Sel.Snapshot): Json<Api.Snapshot> {
    if (!id) throw notFoundErr('no snapshot specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('snapshot', projectSelector)
      return lookupById(db.snapshots, id)
    }

    const project = lookup.project(projectSelector)
    const snapshot = db.snapshots.find((i) => i.project_id === project.id && i.name === id)
    if (!snapshot) throw notFoundErr(`snapshot '${id}'`)

    return snapshot
  },
  vpc({ vpc: id, ...projectSelector }: Sel.Vpc): Json<Api.Vpc> {
    if (!id) throw notFoundErr('no VPC specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('vpc', projectSelector)
      return lookupById(db.vpcs, id)
    }

    const project = lookup.project(projectSelector)
    const vpc = db.vpcs.find((v) => v.project_id === project.id && v.name === id)
    if (!vpc) throw notFoundErr(`vpc '${id}'`)

    return vpc
  },
  vpcRouter({ router: id, ...vpcSelector }: Sel.VpcRouter): Json<Api.VpcRouter> {
    if (!id) throw notFoundErr('no router specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('router', vpcSelector)
      return lookupById(db.vpcRouters, id)
    }

    const vpc = lookup.vpc(vpcSelector)
    const router = db.vpcRouters.find((r) => r.vpc_id === vpc.id && r.name === id)
    if (!router) throw notFoundErr(`router '${id}'`)

    return router
  },
  vpcRouterRoute({
    route: id,
    ...routerSelector
  }: Sel.VpcRouterRoute): Json<Api.RouterRoute> {
    if (!id) throw notFoundErr('no route specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('route', routerSelector)
      return lookupById(db.vpcRouterRoutes, id)
    }

    const router = lookup.vpcRouter(routerSelector)
    const route = db.vpcRouterRoutes.find(
      (r) => r.vpc_router_id === router.id && r.name === id
    )
    if (!route) throw notFoundErr(`route '${id}'`)

    return route
  },
  vpcSubnet({ subnet: id, ...vpcSelector }: Sel.VpcSubnet): Json<Api.VpcSubnet> {
    if (!id) throw notFoundErr('no subnet specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('subnet', vpcSelector)
      return lookupById(db.vpcSubnets, id)
    }

    const vpc = lookup.vpc(vpcSelector)
    const subnet = db.vpcSubnets.find((s) => s.vpc_id === vpc.id && s.name === id)
    if (!subnet) throw notFoundErr(`subnet '${id}'`)

    return subnet
  },
  internetGateway({
    gateway: id,
    ...vpcSelector
  }: Sel.InternetGateway): Json<Api.InternetGateway> {
    if (!id) throw notFoundErr('no internet gateway specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('internet gateway', vpcSelector)
      return lookupById(db.internetGateways, id)
    }

    const vpc = lookup.vpc(vpcSelector)
    const internetGateway = db.internetGateways.find(
      (ig) => ig.vpc_id === vpc.id && ig.name === id
    )
    if (!internetGateway) throw notFoundErr(`internet gateway '${id}'`)

    return internetGateway
  },
  internetGatewayIpAddress({
    address: id,
    ...gatewaySelector
  }: Sel.InternetGatewayIpAddress): Json<Api.InternetGatewayIpAddress> {
    if (!id) throw notFoundErr('no IP address specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('IP address', gatewaySelector)
      return lookupById(db.internetGatewayIpAddresses, id)
    }

    const gateway = lookup.internetGateway(gatewaySelector)
    const ip = db.internetGatewayIpAddresses.find(
      (i) => i.internet_gateway_id === gateway.id && i.name === id
    )
    if (!ip) throw notFoundErr(`IP address '${id}'`)

    return ip
  },
  image({ image: id, project: projectId }: Sel.Image): Json<Api.Image> {
    if (!id) throw notFoundErr('no image specified')

    // We match the API logic:
    //
    //   match image_selector {
    //     (image ID, no project) =>
    //       look up image in DB by ID
    //       if project ID is present, it's a project image, otherwise silo image
    //     (image Name, project specified) => it's a project image
    //     (image Name, no project) => it's a silo image
    //     (image ID, project specified) => error
    //   }
    //
    // https://github.com/oxidecomputer/omicron/blob/219121a/nexus/src/app/image.rs#L32-L76

    if (isUuid(id)) {
      // this matches the error case above
      ensureNoParentSelectors('image', { project: projectId })
      return lookupById(db.images, id)
    }

    let image: Json<Api.Image> | undefined
    if (projectId) {
      // project image
      const project = lookup.project({ project: projectId })
      image = db.images.find((d) => d.project_id === project.id && d.name === id)
    } else {
      // silo image
      image = db.images.find((d) => d.project_id === undefined && d.name === id)
    }

    if (!image) throw notFoundErr(`image '${id}'`)
    return image
  },
  ipPool({ pool: id }: Sel.IpPool): Json<Api.IpPool> {
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
  }: Sel.IpPool & Sel.Silo): Json<Api.IpPoolSiloLink> {
    const pool = lookup.ipPool({ pool: poolId })
    const silo = lookup.silo({ silo: siloId })

    const ipPoolSilo = db.ipPoolSilos.find(
      (ips) => ips.ip_pool_id === pool.id && ips.silo_id === silo.id
    )
    if (!ipPoolSilo) throw notFoundErr(`link for pool '${poolId}' and silo '${siloId}'`)

    return ipPoolSilo
  },
  // unusual because it returns a list, but we need it for multiple endpoints
  siloIpPools(path: Sel.Silo): Json<Api.SiloIpPool>[] {
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
  siloIpPool(path: Sel.Silo & Sel.IpPool): Json<Api.SiloIpPool> {
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
  siloDefaultIpPool(path: Sel.Silo): Json<Api.IpPool> {
    const silo = lookup.silo(path)

    const link = db.ipPoolSilos.find((ips) => ips.silo_id === silo.id && ips.is_default)
    if (!link) throw notFoundErr(`default pool for silo '${path.silo}'`)

    return lookupById(db.ipPools, link.ip_pool_id)
  },
  samlIdp({ provider: id, silo }: Sel.IdentityProvider): Json<Api.SamlIdentityProvider> {
    if (!id) throw notFoundErr('no IdP specified')

    if (isUuid(id)) {
      ensureNoParentSelectors('identity provider', { silo })
      return lookupById(
        db.identityProviders.filter((o) => o.type === 'saml').map((o) => o.provider),
        id
      )
    }

    const dbSilo = lookup.silo({ silo })
    const dbIdp = db.identityProviders.find(
      ({ type, siloId, provider }) =>
        type === 'saml' && siloId === dbSilo.id && provider.name === id
    )

    if (!dbIdp) throw notFoundErr(`IdP '${id}' for silo '${silo}'`)

    return dbIdp.provider
  },
  silo({ silo: id }: Sel.Silo): Json<Api.Silo> {
    if (!id) throw notFoundErr('silo not specified')

    if (isUuid(id)) return lookupById(db.silos, id)

    const silo = db.silos.find((o) => o.name === id)
    if (!silo) throw notFoundErr(`silo '${id}'`)
    return silo
  },
  siloQuotas(params: Sel.Silo): Json<Api.SiloQuotas> {
    const silo = lookup.silo(params)
    const quotas = db.siloQuotas.find((q) => q.silo_id === silo.id)
    if (!quotas) throw internalError(`Silo ${silo.name} has no quotas`)
    return quotas
  },
  sled({ sledId: id }: Sel.Sled): Json<Api.Sled> {
    if (!id) throw notFoundErr('sled not specified')
    return lookupById(db.sleds, id)
  },
  sshKey({ sshKey: id }: Sel.SshKey): Json<Api.SshKey> {
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
  affinityGroups: [...mock.affinityGroups],
  affinityGroupMemberLists: [...mock.affinityGroupMemberLists],
  antiAffinityGroups: [...mock.antiAffinityGroups],
  antiAffinityGroupMemberLists: [...mock.antiAffinityGroupMemberLists],
  deviceTokens: [...mock.deviceTokens],
  disks: [...mock.disks],
  diskBulkImportState: new Map<string, DiskBulkImport>(),
  floatingIps: [...mock.floatingIps],
  userGroups: [...mock.userGroups],
  /** Join table for `users` and `userGroups` */
  groupMemberships: [...mock.groupMemberships],
  images: [...mock.images],
  ephemeralIps: [...mock.ephemeralIps],
  instances: [...mock.instances],
  internetGatewayIpAddresses: [...mock.internetGatewayIpAddresses],
  internetGatewayIpPools: [...mock.internetGatewayIpPools],
  internetGateways: [...mock.internetGateways],
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
  siloSettings: [...siloSettings],
  identityProviders: [...mock.identityProviders],
  sleds: [...mock.sleds],
  switches: [...mock.switches],
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
