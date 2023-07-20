/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { v4 as uuid } from 'uuid'

import type { ApiTypes as Api, SamlIdentityProvider } from '@oxide/api'
import { FLEET_ID, diskCan } from '@oxide/api'
import type { Json } from '@oxide/gen/msw-handlers'
import { json, makeHandlers } from '@oxide/gen/msw-handlers'
import { pick, sortBy } from '@oxide/util'

import { genCumulativeI64Data } from '../metrics'
import { serial } from '../serial'
import { defaultSilo, toIdp } from '../silo'
import { db, lookup, lookupById, notFoundErr } from './db'
import {
  NotImplemented,
  currentUser,
  errIfExists,
  errIfInvalidDiskSize,
  getStartAndEndTime,
  getTimestamps,
  handleMetrics,
  paginated,
  requireFleetViewer,
  unavailableErr,
} from './util'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

export const handlers = makeHandlers({
  deviceAuthRequest: () => 200,
  deviceAuthConfirm: ({ body }) => (body.user_code === 'ERRO-RABC' ? 400 : 200),
  deviceAccessToken: () => 200,
  loginLocal: ({ body: { password } }) => (password === 'bad' ? 401 : 200),
  groupList: (params) => paginated(params.query, db.userGroups),
  groupView: (params) => lookupById(db.userGroups, params.path.groupId),

  projectList: (params) => paginated(params.query, db.projects),
  projectCreate({ body }) {
    errIfExists(db.projects, { name: body.name }, 'project')

    const newProject: Json<Api.Project> = {
      id: uuid(),
      ...body,
      ...getTimestamps(),
    }
    db.projects.push(newProject)

    return json(newProject, { status: 201 })
  },
  projectView: ({ path }) => {
    if (path.project.endsWith('error-503')) {
      throw unavailableErr
    }

    return lookup.project({ ...path })
  },
  projectUpdate({ body, path }) {
    const project = lookup.project({ ...path })
    if (body.name) {
      project.name = body.name
      errIfExists(db.projects, { name: body.name })
    }
    project.description = body.description || ''

    return project
  },
  projectDelete({ path }) {
    const project = lookup.project({ ...path })

    // imitate API logic (TODO: check for every other kind of project child)
    if (db.vpcs.some((vpc) => vpc.project_id === project.id)) {
      throw 'Project to be deleted contains a VPC'
    }

    db.projects = db.projects.filter((p) => p.id !== project.id)

    return 204
  },
  diskList({ query }) {
    const project = lookup.project(query)
    const disks = db.disks.filter((d) => d.project_id === project.id)

    return paginated(query, disks)
  },
  diskCreate({ body, query }) {
    const project = lookup.project(query)

    errIfExists(db.disks, { name: body.name, project_id: project.id })

    if (body.name === 'disk-create-500') throw 500

    const { name, description, size, disk_source } = body
    const newDisk: Json<Api.Disk> = {
      id: uuid(),
      project_id: project.id,
      state:
        disk_source.type === 'importing_blocks'
          ? { state: 'import_ready' }
          : { state: 'creating' },
      device_path: '/mnt/disk',
      name,
      description,
      size,
      // TODO: for non-blank disk sources, look up image or snapshot by ID and
      // pull block size from there
      block_size: disk_source.type === 'blank' ? disk_source.block_size : 512,
      ...getTimestamps(),
    }
    db.disks.push(newDisk)

    return json(newDisk, { status: 201 })
  },
  diskView: ({ path, query }) => lookup.disk({ ...path, ...query }),
  diskDelete({ path, query }) {
    const disk = lookup.disk({ ...path, ...query })

    if (!diskCan.delete(disk)) {
      throw 'Cannot delete disk in state ' + disk.state.state
    }

    db.disks = db.disks.filter((d) => d.id !== disk.id)
    return 204
  },
  diskMetricsList({ path, query }) {
    lookup.disk({ ...path, ...query })

    const { startTime, endTime } = getStartAndEndTime(query)

    if (endTime <= startTime) return { items: [] }

    return {
      items: genCumulativeI64Data(
        new Array(1000).fill(0).map((_x, i) => Math.floor(Math.tanh(i / 500) * 3000)),
        startTime,
        endTime
      ),
    }
  },
  diskBulkWriteImportStart: ({ path, query }) => {
    const disk = lookup.disk({ ...path, ...query })

    if (disk.name === 'import-start-500') throw 500

    if (disk.state.state !== 'import_ready') {
      throw 'Can only enter state importing_from_bulk_write from import_ready'
    }

    // throw 400

    db.diskBulkImportState[disk.id] = { blocks: {} }
    disk.state = { state: 'importing_from_bulk_writes' }
    return 204
  },
  diskBulkWriteImportStop: ({ path, query }) => {
    const disk = lookup.disk({ ...path, ...query })

    if (disk.name === 'import-stop-500') throw 500

    if (disk.state.state !== 'importing_from_bulk_writes') {
      throw 'Can only stop import for disk in state importing_from_bulk_write'
    }

    delete db.diskBulkImportState[disk.id]
    disk.state = { state: 'import_ready' }
    return 204
  },
  diskBulkWriteImport: ({ path, query, body }) => {
    const disk = lookup.disk({ ...path, ...query })
    const diskImport = db.diskBulkImportState[disk.id]
    if (!diskImport) throw notFoundErr
    // if (Math.random() < 0.01) throw 400
    diskImport.blocks[body.offset] = true
    return 204
  },
  diskFinalizeImport: ({ path, query, body }) => {
    const disk = lookup.disk({ ...path, ...query })

    if (disk.name === 'disk-finalize-500') throw 500

    if (disk.state.state !== 'import_ready') {
      throw `Cannot finalize disk in state ${disk.state.state}. Must be import_ready.`
    }

    // for now, don't check that the file is complete. the API doesn't

    disk.state = { state: 'detached' }

    if (body.snapshot_name) {
      const newSnapshot: Json<Api.Snapshot> = {
        id: uuid(),
        name: body.snapshot_name,
        description: 'temporary snapshot for making an image',
        ...getTimestamps(),
        state: 'ready',
        project_id: disk.project_id,
        disk_id: disk.id,
        size: disk.size,
      }
      db.snapshots.push(newSnapshot)
    }

    return 204
  },
  imageList({ query }) {
    if (query.project) {
      const project = lookup.project(query)
      const images = db.images.filter((i) => i.project_id === project.id)
      return paginated(query, images)
    }

    // silo images
    const images = db.images.filter((i) => !i.project_id)
    return paginated(query, images)
  },
  imageCreate({ body, query }) {
    let project_id: string | undefined = undefined
    if (query.project) {
      project_id = lookup.project(query).id
    }
    errIfExists(db.images, { name: body.name, project_id })

    const size =
      body.source.type === 'snapshot'
        ? lookup.snapshot({ snapshot: body.source.id }).size
        : 100

    const block_size = body.source.type === 'url' ? body.source.block_size : 512

    const newImage: Json<Api.Image> = {
      id: uuid(),
      project_id,
      size,
      block_size,
      ...body,
      ...getTimestamps(),
    }
    db.images.push(newImage)
    return json(newImage, { status: 201 })
  },
  imageView: ({ path, query }) => lookup.image({ ...path, ...query }),
  imageDelete({ path, query }) {
    const image = lookup.image({ ...path, ...query })
    db.images = db.images.filter((i) => i.id !== image.id)

    return 204
  },
  imagePromote({ path, query }) {
    const image = lookup.image({ ...path, ...query })

    delete image.project_id

    return json(image, { status: 202 })
  },
  imageDemote({ path, query }) {
    const image = lookup.image({ ...path, ...query })
    const project = lookup.project({ ...path, ...query })

    image.project_id = project.id

    return json(image, { status: 202 })
  },
  instanceList({ query }) {
    const project = lookup.project(query)
    const instances = db.instances.filter((i) => i.project_id === project.id)
    return paginated(query, instances)
  },
  instanceCreate({ body, query }) {
    const project = lookup.project(query)

    errIfExists(db.instances, { name: body.name, project_id: project.id }, 'instance')

    const instanceId = uuid()

    /**
     * Eagerly check for disk errors. Execution will stop early and prevent orphaned disks from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    for (const diskParams of body.disks || []) {
      if (diskParams.type === 'create') {
        errIfExists(db.disks, { name: diskParams.name, project_id: project.id }, 'disk')
        errIfInvalidDiskSize(diskParams)
      } else {
        lookup.disk({ ...query, disk: diskParams.name })
      }
    }

    /**
     * Eagerly check for nic lookup failures. Execution will stop early and prevent orphaned nics from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    if (body.network_interfaces?.type === 'create') {
      body.network_interfaces.params.forEach(({ vpc_name, subnet_name }) => {
        lookup.vpc({ ...query, vpc: vpc_name })
        lookup.vpcSubnet({ ...query, vpc: vpc_name, subnet: subnet_name })
      })
    }

    for (const diskParams of body.disks || []) {
      if (diskParams.type === 'create') {
        const { size, name, description, disk_source } = diskParams
        const newDisk: Json<Api.Disk> = {
          id: uuid(),
          name,
          description,
          size,
          project_id: project.id,
          state: { state: 'attached', instance: instanceId },
          device_path: '/mnt/disk',
          block_size: disk_source.type === 'blank' ? disk_source.block_size : 4096,
          ...getTimestamps(),
        }
        db.disks.push(newDisk)
      } else {
        const disk = lookup.disk({ ...query, disk: diskParams.name })
        disk.state = { state: 'attached', instance: instanceId }
      }
    }

    if (body.network_interfaces?.type === 'default') {
      db.networkInterfaces.push({
        id: uuid(),
        description: 'The default network interface',
        instance_id: instanceId,
        primary: true,
        mac: '00:00:00:00:00:00',
        ip: '127.0.0.1',
        name: 'default',
        vpc_id: uuid(),
        subnet_id: uuid(),
        ...getTimestamps(),
      })
    } else if (body.network_interfaces?.type === 'create') {
      body.network_interfaces.params.forEach(
        ({ name, description, ip, subnet_name, vpc_name }, i) => {
          db.networkInterfaces.push({
            id: uuid(),
            name,
            description,
            instance_id: instanceId,
            primary: i === 0 ? true : false,
            mac: '00:00:00:00:00:00',
            ip: ip || '127.0.0.1',
            vpc_id: lookup.vpc({ ...query, vpc: vpc_name }).id,
            subnet_id: lookup.vpcSubnet({ ...query, vpc: vpc_name, subnet: subnet_name })
              .id,
            ...getTimestamps(),
          })
        }
      )
    }

    const newInstance: Json<Api.Instance> = {
      id: instanceId,
      project_id: project.id,
      ...pick(body, 'name', 'description', 'hostname', 'memory', 'ncpus'),
      ...getTimestamps(),
      run_state: 'running',
      time_run_state_updated: new Date().toISOString(),
    }
    db.instances.push(newInstance)
    return json(newInstance, { status: 201 })
  },
  instanceView: ({ path, query }) => lookup.instance({ ...path, ...query }),
  instanceDelete({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    db.instances = db.instances.filter((i) => i.id !== instance.id)
    return 204
  },
  instanceDiskList({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    // TODO: Should disk instance state be `instance_id` instead of `instance`?
    const disks = db.disks.filter(
      (d) => 'instance' in d.state && d.state.instance === instance.id
    )
    return paginated(query, disks)
  },
  instanceDiskAttach({ body, path, query: projectParams }) {
    const instance = lookup.instance({ ...path, ...projectParams })
    if (instance.run_state !== 'stopped') {
      throw 'Cannot attach disk to instance that is not stopped'
    }
    const disk = lookup.disk({ ...projectParams, disk: body.disk })
    disk.state = {
      state: 'attached',
      instance: instance.id,
    }
    return disk
  },
  instanceDiskDetach({ body, path, query: projectParams }) {
    const instance = lookup.instance({ ...path, ...projectParams })
    if (instance.run_state !== 'stopped') {
      throw 'Cannot detach disk to instance that is not stopped'
    }
    const disk = lookup.disk({ ...projectParams, disk: body.disk })
    disk.state = { state: 'detached' }
    return disk
  },
  instanceExternalIpList({ path, query }) {
    lookup.instance({ ...path, ...query })

    // TODO: proper mock table
    return {
      items: [
        {
          ip: '123.4.56.7',
          kind: 'ephemeral',
        } as const,
      ],
    }
  },
  instanceNetworkInterfaceList({ query }) {
    const instance = lookup.instance(query)
    const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
    return paginated(query, nics)
  },
  instanceNetworkInterfaceCreate({ body, query }) {
    const instance = lookup.instance(query)
    const nicsForInstance = db.networkInterfaces.filter(
      (n) => n.instance_id === instance.id
    )
    errIfExists(nicsForInstance, { name: body.name })

    const { name, description, subnet_name, vpc_name, ip } = body

    const vpc = lookup.vpc({ ...query, vpc: vpc_name })
    const subnet = lookup.vpcSubnet({ ...query, vpc: vpc_name, subnet: subnet_name })

    const newNic: Json<Api.InstanceNetworkInterface> = {
      id: uuid(),
      // matches API logic: https://github.com/oxidecomputer/omicron/blob/ae22982/nexus/src/db/queries/network_interface.rs#L982-L1015
      primary: nicsForInstance.length === 0,
      instance_id: instance.id,
      name,
      description,
      ip: ip || '123.45.68.8',
      vpc_id: vpc.id,
      subnet_id: subnet.id,
      mac: '',
      ...getTimestamps(),
    }
    db.networkInterfaces.push(newNic)

    return newNic
  },
  instanceNetworkInterfaceView: ({ path, query }) =>
    lookup.networkInterface({ ...path, ...query }),
  instanceNetworkInterfaceUpdate({ body, path, query }) {
    const nic = lookup.networkInterface({ ...path, ...query })

    if (body.name) {
      nic.name = body.name
    }
    if (typeof body.description === 'string') {
      nic.description = body.description
    }

    if (typeof body.primary === 'boolean' && body.primary !== nic.primary) {
      if (nic.primary) {
        throw 'Cannot remove the primary interface'
      }
      db.networkInterfaces
        .filter((n) => n.instance_id === nic.instance_id)
        .forEach((n) => {
          n.primary = false
        })
      nic.primary = !!body.primary
    }

    return nic
  },
  instanceNetworkInterfaceDelete({ path, query }) {
    const nic = lookup.networkInterface({ ...path, ...query })
    db.networkInterfaces = db.networkInterfaces.filter((n) => n.id !== nic.id)
    return 204
  },
  instanceReboot({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    instance.run_state = 'rebooting'

    setTimeout(() => {
      instance.run_state = 'running'
    }, 3000)

    return json(instance, { status: 202 })
  },
  instanceSerialConsole(_params) {
    // TODO: Add support for params
    return json(serial, { delay: 3000 })
  },
  instanceStart({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    instance.run_state = 'running'

    return json(instance, { status: 202 })
  },
  instanceStop({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    instance.run_state = 'stopped'

    return json(instance, { status: 202 })
  },
  projectPolicyView({ path }) {
    const project = lookup.project(path)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  projectPolicyUpdate({ body, path }) {
    const project = lookup.project(path)

    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'project' as const,
      resource_id: project.id,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'project' && r.resource_id === project.id)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    // TODO: Is this the right thing to return?
    return body
  },
  snapshotList(params) {
    const project = lookup.project(params.query)
    const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
    return paginated(params.query, snapshots)
  },
  snapshotCreate({ body, query }) {
    const project = lookup.project(query)

    errIfExists(db.snapshots, { name: body.name })

    const disk = lookup.disk({ ...query, disk: body.disk })
    if (!diskCan.snapshot(disk)) {
      throw 'Cannot snapshot disk in state ' + disk.state.state
    }

    const newSnapshot: Json<Api.Snapshot> = {
      id: uuid(),
      ...body,
      ...getTimestamps(),
      state: 'ready',
      project_id: project.id,
      disk_id: disk.id,
      size: disk.size,
    }
    db.snapshots.push(newSnapshot)

    return json(newSnapshot, { status: 201 })
  },
  snapshotView: ({ path, query }) => lookup.snapshot({ ...path, ...query }),
  snapshotDelete({ path, query }) {
    if (path.snapshot === 'delete-500') return 500

    const snapshot = lookup.snapshot({ ...path, ...query })
    db.snapshots = db.snapshots.filter((s) => s.id !== snapshot.id)
    return 204
  },
  vpcList({ query }) {
    const project = lookup.project(query)
    const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
    return paginated(query, vpcs)
  },
  vpcCreate({ body, query }) {
    const project = lookup.project(query)
    errIfExists(db.vpcs, { name: body.name })

    const newVpc: Json<Api.Vpc> = {
      id: uuid(),
      project_id: project.id,
      system_router_id: uuid(),
      ...body,
      // API is supposed to generate one if none provided. close enough
      ipv6_prefix: body.ipv6_prefix || 'fd2d:4569:88b2::/64',
      ...getTimestamps(),
    }
    db.vpcs.push(newVpc)

    // Also create a default subnet
    const newSubnet: Json<Api.VpcSubnet> = {
      id: uuid(),
      name: 'default',
      vpc_id: newVpc.id,
      ipv6_block: 'fd2d:4569:88b1::/64',
      description: '',
      ipv4_block: '',
      ...getTimestamps(),
    }
    db.vpcSubnets.push(newSubnet)

    return json(newVpc, { status: 201 })
  },
  vpcView: ({ path, query }) => lookup.vpc({ ...path, ...query }),
  vpcUpdate({ body, path, query }) {
    const vpc = lookup.vpc({ ...path, ...query })

    if (body.name) {
      vpc.name = body.name
    }

    if (typeof body.description === 'string') {
      vpc.description = body.description
    }

    if (body.dns_name) {
      vpc.dns_name = body.dns_name
    }
    return vpc
  },
  vpcDelete({ path, query }) {
    const vpc = lookup.vpc({ ...path, ...query })

    db.vpcs = db.vpcs.filter((v) => v.id !== vpc.id)
    db.vpcSubnets = db.vpcSubnets.filter((s) => s.vpc_id !== vpc.id)
    db.vpcFirewallRules = db.vpcFirewallRules.filter((r) => r.vpc_id !== vpc.id)

    const routersToRemove = db.vpcRouters
      .filter((r) => r.vpc_id === vpc.id)
      .map((r) => r.id)
    db.vpcRouterRoutes = db.vpcRouterRoutes.filter(
      (r) => !routersToRemove.includes(r.vpc_router_id)
    )
    db.vpcRouters = db.vpcRouters.filter((r) => r.vpc_id !== vpc.id)

    return 204
  },
  vpcFirewallRulesView({ query }) {
    const vpc = lookup.vpc(query)
    const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)

    return { rules: sortBy(rules, (r) => r.name) }
  },
  vpcFirewallRulesUpdate({ body, query }) {
    const vpc = lookup.vpc(query)

    const rules = body.rules.map((rule) => ({
      vpc_id: vpc.id,
      id: uuid(),
      ...rule,
      ...getTimestamps(),
    }))

    // replace existing rules for this VPC with the new ones
    db.vpcFirewallRules = [
      ...db.vpcFirewallRules.filter((r) => r.vpc_id !== vpc.id),
      ...rules,
    ]

    return { rules: sortBy(rules, (r) => r.name) }
  },
  vpcRouterList({ query }) {
    const vpc = lookup.vpc(query)
    const routers = db.vpcRouters.filter((r) => r.vpc_id === vpc.id)
    return paginated(query, routers)
  },
  vpcRouterCreate({ body, query }) {
    const vpc = lookup.vpc(query)
    errIfExists(db.vpcRouters, { vpc_id: vpc.id, name: body.name })

    const newRouter: Json<Api.VpcRouter> = {
      id: uuid(),
      vpc_id: vpc.id,
      kind: 'custom',
      ...body,
      ...getTimestamps(),
    }
    db.vpcRouters.push(newRouter)
    return json(newRouter, { status: 201 })
  },
  vpcRouterView: ({ path, query }) => lookup.vpcRouter({ ...path, ...query }),
  vpcRouterUpdate({ body, path, query }) {
    const router = lookup.vpcRouter({ ...path, ...query })

    if (body.name) {
      router.name = body.name
    }
    if (typeof body.description === 'string') {
      router.description = body.description
    }

    return router
  },
  vpcRouterDelete({ path, query }) {
    const router = lookup.vpcRouter({ ...path, ...query })

    // TODO: Are there routers that can't be deleted?
    db.vpcRouters = db.vpcRouters.filter((r) => r.id !== router.id)

    return 204
  },
  vpcRouterRouteList({ query }) {
    const router = lookup.vpcRouter(query)
    const routers = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
    return paginated(query, routers)
  },
  vpcRouterRouteCreate({ body, query }) {
    const router = lookup.vpcRouter(query)

    errIfExists(db.vpcRouterRoutes, { vpc_router_id: router.id, name: body.name })

    const newRoute: Json<Api.RouterRoute> = {
      id: uuid(),
      vpc_router_id: router.id,
      kind: 'custom',
      ...body,
      ...getTimestamps(),
    }
    return json(newRoute, { status: 201 })
  },
  vpcRouterRouteView: ({ path, query }) => lookup.vpcRouterRoute({ ...path, ...query }),
  vpcRouterRouteUpdate({ body, path, query }) {
    const route = lookup.vpcRouterRoute({ ...path, ...query })
    if (route.kind !== 'custom') {
      throw 'Only custom routes may be modified'
    }
    if (body.name) {
      route.name = body.name
    }
    if (typeof body.description === 'string') {
      route.description = body.description
    }
    return route
  },
  vpcRouterRouteDelete({ path, query }) {
    const route = lookup.vpcRouterRoute({ ...path, ...query })
    if (route.kind !== 'custom') {
      throw 'Only custom routes may be modified'
    }
    db.vpcRouterRoutes = db.vpcRouterRoutes.filter((r) => r.id !== route.id)
    return 204
  },
  vpcSubnetList({ query }) {
    const vpc = lookup.vpc(query)
    const subnets = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
    return paginated(query, subnets)
  },
  vpcSubnetCreate({ body, query }) {
    const vpc = lookup.vpc(query)
    errIfExists(db.vpcSubnets, { vpc_id: vpc.id, name: body.name })

    // TODO: Create a route for the subnet in the default router
    const newSubnet: Json<Api.VpcSubnet> = {
      id: uuid(),
      vpc_id: vpc.id,
      ...body,
      // required in subnet create but not in update, so we need a fallback.
      // API says "A random `/64` block will be assigned if one is not
      // provided." Our fallback is not random, but it should be good enough.
      ipv6_block: body.ipv6_block || 'fd2d:4569:88b1::/64',
      ...getTimestamps(),
    }
    db.vpcSubnets.push(newSubnet)
    return json(newSubnet, { status: 201 })
  },
  vpcSubnetView: ({ path, query }) => lookup.vpcSubnet({ ...path, ...query }),
  vpcSubnetUpdate({ body, path, query }) {
    const subnet = lookup.vpcSubnet({ ...path, ...query })

    if (body.name) {
      subnet.name = body.name
    }
    if (typeof body.description === 'string') {
      subnet.description = body.description
    }

    return subnet
  },
  vpcSubnetDelete({ path, query }) {
    const subnet = lookup.vpcSubnet({ ...path, ...query })
    db.vpcSubnets = db.vpcSubnets.filter((s) => s.id !== subnet.id)

    return 204
  },
  vpcSubnetListNetworkInterfaces({ path, query }) {
    const subnet = lookup.vpcSubnet({ ...path, ...query })
    const nics = db.networkInterfaces.filter((n) => n.subnet_id === subnet.id)
    return paginated(query, nics)
  },
  sledPhysicalDiskList({ path, query, req }) {
    requireFleetViewer(req)
    const sled = lookup.sled(path)
    const disks = db.physicalDisks.filter((n) => n.sled_id === sled.id)
    return paginated(query, disks)
  },
  physicalDiskList({ query, req }) {
    requireFleetViewer(req)
    return paginated(query, db.physicalDisks)
  },
  policyView() {
    // assume we're in the default silo
    const siloId = defaultSilo.id
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'silo' && r.resource_id === siloId)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  policyUpdate({ body }) {
    const siloId = defaultSilo.id
    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'silo' as const,
      resource_id: siloId,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'silo' && r.resource_id === siloId)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return body
  },
  rackList: ({ query, req }) => {
    requireFleetViewer(req)
    return paginated(query, db.racks)
  },
  currentUserView({ req }) {
    return { ...currentUser(req), silo_name: defaultSilo.name }
  },
  currentUserGroups({ req }) {
    const user = currentUser(req)
    const memberships = db.groupMemberships.filter((gm) => gm.userId === user.id)
    const groupIds = new Set(memberships.map((gm) => gm.groupId))
    const groups = db.userGroups.filter((g) => groupIds.has(g.id))
    return { items: groups }
  },
  currentUserSshKeyList({ query, req }) {
    const user = currentUser(req)
    const keys = db.sshKeys.filter((k) => k.silo_user_id === user.id)
    return paginated(query, keys)
  },
  currentUserSshKeyCreate({ body, req }) {
    const user = currentUser(req)
    errIfExists(db.sshKeys, { silo_user_id: user.id, name: body.name })

    const newSshKey: Json<Api.SshKey> = {
      id: uuid(),
      silo_user_id: user.id,
      ...body,
      ...getTimestamps(),
    }
    db.sshKeys.push(newSshKey)
    return json(newSshKey, { status: 201 })
  },
  currentUserSshKeyView: ({ path }) => lookup.sshKey(path),
  currentUserSshKeyDelete({ path }) {
    const sshKey = lookup.sshKey(path)
    db.sshKeys = db.sshKeys.filter((i) => i.id !== sshKey.id)
    return 204
  },
  sledView({ path, req }) {
    requireFleetViewer(req)
    return lookup.sled(path)
  },
  sledList({ query, req }) {
    requireFleetViewer(req)
    return paginated(query, db.sleds)
  },
  sledInstanceList({ query, path, req }) {
    requireFleetViewer(req)
    const sled = lookupById(db.sleds, path.sledId)
    return paginated(
      query,
      db.instances.map((i) => {
        const project = lookupById(db.projects, i.project_id)
        return {
          ...pick(i, 'id', 'name', 'time_created', 'time_modified', 'memory', 'ncpus'),
          state: 'running',
          active_sled_id: sled.id,
          project_name: project.name,
          silo_name: defaultSilo.name,
        }
      })
    )
  },
  siloList({ query, req }) {
    requireFleetViewer(req)
    return paginated(query, db.silos)
  },
  siloCreate({ body, req }) {
    requireFleetViewer(req)
    errIfExists(db.silos, { name: body.name })
    const newSilo: Json<Api.Silo> = {
      id: uuid(),
      ...getTimestamps(),
      ...body,
      mapped_fleet_roles: body.mapped_fleet_roles || {},
    }
    db.silos.push(newSilo)
    return json(newSilo, { status: 201 })
  },
  siloView({ path, req }) {
    requireFleetViewer(req)
    return lookup.silo(path)
  },
  siloDelete({ path, req }) {
    requireFleetViewer(req)
    const silo = lookup.silo(path)
    db.silos = db.silos.filter((i) => i.id !== silo.id)
    return 204
  },
  siloIdentityProviderList({ query, req }) {
    requireFleetViewer(req)
    const silo = lookup.silo(query)
    const idps = db.identityProviders.filter(({ siloId }) => siloId === silo.id).map(toIdp)
    return { items: idps }
  },

  samlIdentityProviderCreate({ query, body, req }) {
    requireFleetViewer(req)
    const silo = lookup.silo(query)

    // this is a bit silly, but errIfExists doesn't handle nested keys like
    // provider.name, so to do the check we make a flatter object
    errIfExists(
      db.identityProviders.map(({ siloId, provider }) => ({ siloId, name: provider.name })),
      { siloId: silo.id, name: body.name }
    )

    // we just decode to string and store that, which is probably fine for local
    // dev, but note that the API decodes to bytes and passes that to
    // https://docs.rs/openssl/latest/openssl/x509/struct.X509.html#method.from_der
    // and that will error if can't be parsed that way
    let public_cert = body.signing_keypair?.public_cert
    public_cert = public_cert ? atob(public_cert) : undefined

    // we ignore the private key because it's not returned in the get response,
    // so you'll never see it again. But worth noting that in the real thing
    // it is parsed with this
    // https://docs.rs/openssl/latest/openssl/rsa/struct.Rsa.html#method.private_key_from_der

    const provider: Json<SamlIdentityProvider> = {
      id: uuid(),
      ...pick(
        body,
        'name',
        'acs_url',
        'description',
        'idp_entity_id',
        'slo_url',
        'sp_client_id',
        'technical_contact_email'
      ),
      public_cert,
      ...getTimestamps(),
    }

    db.identityProviders.push({ type: 'saml', siloId: silo.id, provider })
    return provider
  },
  samlIdentityProviderView: ({ path, query }) => lookup.samlIdp({ ...path, ...query }),

  userList: ({ query }) => {
    // query.group is validated by generated code to be a UUID if present
    if (query.group) {
      const group = lookupById(db.userGroups, query.group) // 404 if doesn't exist
      const memberships = db.groupMemberships.filter((gm) => gm.groupId === group.id)
      const userIds = new Set(memberships.map((gm) => gm.userId))
      const users = db.users.filter((u) => userIds.has(u.id))
      return paginated(query, users)
    }

    return paginated(query, db.users)
  },

  systemPolicyView({ req }) {
    requireFleetViewer(req)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'fleet' && r.resource_id === FLEET_ID)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  systemMetric(params) {
    requireFleetViewer(params.req)
    return handleMetrics(params)
  },
  siloMetric: handleMetrics,

  // Misc endpoints we're not using yet in the console
  certificateCreate: NotImplemented,
  certificateDelete: NotImplemented,
  certificateList: NotImplemented,
  certificateView: NotImplemented,
  diskImportBlocksFromUrl: NotImplemented,
  instanceMigrate: NotImplemented,
  instanceSerialConsoleStream: NotImplemented,
  ipPoolCreate: NotImplemented,
  ipPoolDelete: NotImplemented,
  ipPoolList: NotImplemented,
  ipPoolRangeAdd: NotImplemented,
  ipPoolRangeList: NotImplemented,
  ipPoolRangeRemove: NotImplemented,
  ipPoolServiceRangeAdd: NotImplemented,
  ipPoolServiceRangeList: NotImplemented,
  ipPoolServiceRangeRemove: NotImplemented,
  ipPoolServiceView: NotImplemented,
  ipPoolUpdate: NotImplemented,
  ipPoolView: NotImplemented,
  localIdpUserCreate: NotImplemented,
  localIdpUserDelete: NotImplemented,
  localIdpUserSetPassword: NotImplemented,
  loginSaml: NotImplemented,
  logout: NotImplemented,
  networkingAddressLotBlockList: NotImplemented,
  networkingAddressLotCreate: NotImplemented,
  networkingAddressLotDelete: NotImplemented,
  networkingAddressLotList: NotImplemented,
  networkingLoopbackAddressCreate: NotImplemented,
  networkingLoopbackAddressDelete: NotImplemented,
  networkingLoopbackAddressList: NotImplemented,
  networkingSwitchPortApplySettings: NotImplemented,
  networkingSwitchPortClearSettings: NotImplemented,
  networkingSwitchPortList: NotImplemented,
  networkingSwitchPortSettingsCreate: NotImplemented,
  networkingSwitchPortSettingsDelete: NotImplemented,
  networkingSwitchPortSettingsView: NotImplemented,
  networkingSwitchPortSettingsList: NotImplemented,
  projectIpPoolList: NotImplemented,
  projectIpPoolView: NotImplemented,
  rackView: NotImplemented,
  roleList: NotImplemented,
  roleView: NotImplemented,
  siloPolicyUpdate: NotImplemented,
  siloPolicyView: NotImplemented,
  siloUserList: NotImplemented,
  siloUserView: NotImplemented,
  switchList: NotImplemented,
  switchView: NotImplemented,
  systemPolicyUpdate: NotImplemented,
  userBuiltinList: NotImplemented,
  userBuiltinView: NotImplemented,
})
