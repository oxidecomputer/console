/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { addHours } from 'date-fns'
import { delay } from 'msw'
import * as R from 'remeda'
import { match } from 'ts-pattern'
import { validate as isUuid, v4 as uuid } from 'uuid'

import {
  diskCan,
  FLEET_ID,
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  INSTANCE_MIN_RAM_GiB,
  MAX_NICS_PER_INSTANCE,
  type AffinityGroupMember,
  type AntiAffinityGroupMember,
  type ApiTypes as Api,
  type InstanceDiskAttachment,
  type SamlIdentityProvider,
} from '@oxide/api'

import { json, makeHandlers, type Json } from '~/api/__generated__/msw-handlers'
import { instanceCan, OXQL_GROUP_BY_ERROR } from '~/api/util'
import { commaSeries } from '~/util/str'
import { GiB } from '~/util/units'

import { defaultSilo, toIdp } from '../silo'
import { getTimestamps } from '../util'
import { defaultFirewallRules } from '../vpc'
import {
  db,
  getIpFromPool,
  lookup,
  lookupById,
  notFoundErr,
  resolveIpPool,
  utilizationForSilo,
} from './db'
import {
  currentUser,
  errIfExists,
  errIfInvalidDiskSize,
  forbiddenErr,
  handleMetrics,
  handleOxqlMetrics,
  ipRangeLen,
  NotImplemented,
  paginated,
  requireFleetCollab,
  requireFleetViewer,
  requireRole,
  unavailableErr,
  updateDesc,
  userHasRole,
} from './util'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

export const handlers = makeHandlers({
  logout: () => 204,
  ping: () => ({ status: 'ok' }),
  deviceAuthRequest: () => 200,
  deviceAuthConfirm: ({ body }) => (body.user_code === 'ERRO-RABC' ? 400 : 200),
  deviceAccessToken: () => 200,
  loginLocal: ({ body: { password } }) => (password === 'bad' ? 401 : 200),
  groupList: (params) => paginated(params.query, db.userGroups),
  groupView: (params) => lookupById(db.userGroups, params.path.groupId),
  projectList: ({ query, cookies }) => {
    // this is used to test for the IdP misconfig situation where the user has
    // no role on the silo (see error-pages.e2e.ts). requireRole checks for _at
    // least_ viewer, and viewer is the weakest role, so checking for viewer
    // effectively means "do I have any role at all"
    requireRole(cookies, 'silo', defaultSilo.id, 'viewer')
    return paginated(query, db.projects)
  },
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
      throw unavailableErr()
    } else if (path.project.endsWith('error-403')) {
      throw forbiddenErr()
    }

    return lookup.project({ ...path })
  },
  projectUpdate({ body, path }) {
    const project = lookup.project({ ...path })
    if (body.name) {
      // only check for existing name if it's being changed
      if (body.name !== project.name) {
        errIfExists(db.projects, { name: body.name })
      }
      project.name = body.name
    }
    updateDesc(project, body)

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
          : { state: 'detached' },
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
  async diskBulkWriteImportStart({ path, query }) {
    const disk = lookup.disk({ ...path, ...query })

    if (disk.name === 'import-start-500') throw 500

    if (disk.state.state !== 'import_ready') {
      throw 'Can only enter state importing_from_bulk_write from import_ready'
    }

    await delay(2000) // slow it down for the tests

    db.diskBulkImportState.set(disk.id, { blocks: {} })
    disk.state = { state: 'importing_from_bulk_writes' }
    return 204
  },
  async diskBulkWriteImportStop({ path, query }) {
    const disk = lookup.disk({ ...path, ...query })

    if (disk.name === 'import-stop-500') throw 500

    if (disk.state.state !== 'importing_from_bulk_writes') {
      throw 'Can only stop import for disk in state importing_from_bulk_write'
    }
    await delay(2000) // slow it down for the tests

    db.diskBulkImportState.delete(disk.id)
    disk.state = { state: 'import_ready' }
    return 204
  },
  async diskBulkWriteImport({ path, query, body }) {
    const disk = lookup.disk({ ...path, ...query })
    const diskImport = db.diskBulkImportState.get(disk.id)
    if (!diskImport) throw notFoundErr(`disk import for disk '${disk.id}'`)
    await delay(1000) // slow it down for the tests
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
  floatingIpCreate({ body, query }) {
    const project = lookup.project(query)
    errIfExists(db.floatingIps, { name: body.name, project_id: project.id })

    // TODO: when IP is specified, use ipInAnyRange to check that it is in the pool
    const pool = body.pool
      ? lookup.siloIpPool({ pool: body.pool, silo: defaultSilo.id })
      : lookup.siloDefaultIpPool({ silo: defaultSilo.id })

    const newFloatingIp: Json<Api.FloatingIp> = {
      id: uuid(),
      project_id: project.id,
      // TODO: use ip-num to actually get the next available IP in the pool
      ip:
        body.ip ||
        Array.from({ length: 4 })
          .map(() => Math.floor(Math.random() * 256))
          .join('.'),
      ip_pool_id: pool.id,
      description: body.description,
      name: body.name,
      ...getTimestamps(),
    }
    db.floatingIps.push(newFloatingIp)
    return json(newFloatingIp, { status: 201 })
  },
  floatingIpList({ query }) {
    const project = lookup.project(query)
    const ips = db.floatingIps.filter((i) => i.project_id === project.id)
    return paginated(query, ips)
  },
  floatingIpView: ({ path, query }) => lookup.floatingIp({ ...path, ...query }),
  floatingIpUpdate: ({ path, query, body }) => {
    const floatingIp = lookup.floatingIp({ ...path, ...query })
    if (body.name) {
      // only check for existing name if it's being changed
      if (body.name !== floatingIp.name) {
        errIfExists(db.floatingIps, { name: body.name, project_id: floatingIp.project_id })
      }
      floatingIp.name = body.name
    }
    updateDesc(floatingIp, body)
    return floatingIp
  },
  floatingIpDelete({ path, query }) {
    const floatingIp = lookup.floatingIp({ ...path, ...query })
    db.floatingIps = db.floatingIps.filter((i) => i.id !== floatingIp.id)

    return 204
  },
  floatingIpAttach({ path: { floatingIp }, query: { project }, body }) {
    const dbFloatingIp = lookup.floatingIp({ floatingIp, project })
    if (dbFloatingIp.instance_id) {
      throw 'floating IP cannot be attached to one instance while still attached to another'
    }
    // Following the API logic here, which says that when the instance is passed
    // by name, we pull the project ID off the floating IP.
    //
    // https://github.com/oxidecomputer/omicron/blob/e434307/nexus/src/app/external_ip.rs#L171-L201
    const dbInstance = lookup.instance({
      instance: body.parent,
      project: isUuid(body.parent) ? undefined : project,
    })
    dbFloatingIp.instance_id = dbInstance.id

    return dbFloatingIp
  },
  floatingIpDetach({ path, query }) {
    const floatingIp = lookup.floatingIp({ ...path, ...query })
    db.floatingIps = db.floatingIps.map((ip) =>
      ip.id !== floatingIp.id ? ip : { ...ip, instance_id: undefined }
    )

    return floatingIp
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

    const newImage: Json<Api.Image> = {
      id: uuid(),
      project_id,
      size,
      block_size: 512,
      ...body,
      ...getTimestamps(),
    }
    db.images.push(newImage)
    return json(newImage, { status: 201 })
  },
  imageView: ({ path, query }) => lookup.image({ ...path, ...query }),
  imageDelete({ path, query, cookies }) {
    // if it's a silo image, you need silo write to delete it
    if (!query.project) {
      requireRole(cookies, 'silo', defaultSilo.id, 'collaborator')
    }

    const image = lookup.image({ ...path, ...query })
    db.images = db.images.filter((i) => i.id !== image.id)

    return 204
  },
  imagePromote({ path, query }) {
    const image = lookup.image({ ...path, ...query })

    delete image.project_id

    return json(image, { status: 202 })
  },
  imageDemote({ path: { image }, query: { project } }) {
    // unusual case because the project is never used to resolve the image. you
    // can only demote silo images, and whether we have an image name or ID, if
    // there is no project specified, the lookup assumes it's a silo image
    const dbImage = lookup.image({ image })
    const dbProject = lookup.project({ project })

    dbImage.project_id = dbProject.id

    return json(dbImage, { status: 202 })
  },
  instanceList({ query }) {
    const project = lookup.project(query)
    const instances = db.instances.filter((i) => i.project_id === project.id)
    return paginated(query, instances)
  },
  instanceCreate({ body, query }) {
    const project = lookup.project(query)

    if (body.name === 'no-default-pool') {
      throw notFoundErr('default IP pool for current silo')
    }

    errIfExists(db.instances, { name: body.name, project_id: project.id }, 'instance')

    const instanceId = uuid()

    if (body.memory > INSTANCE_MAX_RAM_GiB * GiB) {
      throw `Memory can be at most ${INSTANCE_MAX_RAM_GiB} GiB`
    }

    if (body.memory < INSTANCE_MIN_RAM_GiB * GiB) {
      throw `Memory must be at least ${INSTANCE_MIN_RAM_GiB} GiB`
    }

    if (body.ncpus > INSTANCE_MAX_CPU) {
      throw `vCPUs must be less than ${INSTANCE_MAX_CPU}`
    }

    if (body.ncpus < 1) {
      throw `Must have at least 1 vCPU`
    }

    /**
     * Eagerly check for disk errors. Execution will stop early and prevent orphaned disks from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    const allDisks: Json<InstanceDiskAttachment>[] = []
    if (body.disks) allDisks.push(...body.disks)
    if (body.boot_disk) allDisks.push(body.boot_disk)

    for (const diskParams of allDisks) {
      if (diskParams.type === 'create') {
        errIfExists(db.disks, { name: diskParams.name, project_id: project.id }, 'disk')
        errIfInvalidDiskSize(diskParams)
      } else {
        const disk = lookup.disk({ ...query, disk: diskParams.name })
        if (disk.state.state !== 'detached')
          throw `Disk '${diskParams.name}' is already attached to an instance`
      }
    }

    /**
     * Eagerly check for nic lookup failures. Execution will stop early and prevent orphaned nics from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    if (body.network_interfaces?.type === 'create') {
      if (body.network_interfaces.params.length > MAX_NICS_PER_INSTANCE) {
        throw `Cannot create more than ${MAX_NICS_PER_INSTANCE} nics per instance`
      }
      body.network_interfaces.params.forEach(({ vpc_name, subnet_name }) => {
        lookup.vpc({ ...query, vpc: vpc_name })
        lookup.vpcSubnet({ ...query, vpc: vpc_name, subnet: subnet_name })
      })
    }

    // validate floating IP attachments before we actually do anything
    body.external_ips?.forEach((ip) => {
      if (ip.type === 'floating') {
        // throw if floating IP doesn't exist
        const floatingIp = lookup.floatingIp({
          project: project.id,
          floatingIp: ip.floating_ip,
        })
        if (floatingIp.instance_id) {
          throw 'floating IP cannot be attached to one instance while still attached to another'
        }
      } else {
        // just make sure we can get one. technically this will only throw
        // if there are no ranges in the pool or if the pool doesn't exist,
        // which aren't quite as good as checking that there are actually IPs
        // available, but they are good things to check
        const pool = resolveIpPool(ip.pool)
        getIpFromPool(pool)
      }
    })

    //////////////////////////////////////////////////////////////////////////
    // DB WRITES START HERE
    //
    // We don't have transactions or sagas, so we need to make sure we do all
    // our validation and throw any errors about bad input before we make any
    // changes to the DB that would have to be undone on failure.
    //////////////////////////////////////////////////////////////////////////

    for (const diskParams of allDisks) {
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

    // at this point, the boot disk has been created, so just retrieve it again
    const bootDiskId = body.boot_disk?.name
      ? lookup.disk({ disk: body.boot_disk.name, project: project.id }).id
      : undefined

    // just use the first VPC in the project and first subnet in the VPC. bit of
    // a hack but not very important
    const anyVpc = db.vpcs.find((v) => v.project_id === project.id)
    const anySubnet = db.vpcSubnets.find((s) => s.vpc_id === anyVpc?.id)
    if (body.network_interfaces?.type === 'default' && anyVpc && anySubnet) {
      db.networkInterfaces.push({
        id: uuid(),
        description: 'The default network interface',
        instance_id: instanceId,
        primary: true,
        mac: '00:00:00:00:00:00',
        ip: '127.0.0.1',
        name: 'default',
        vpc_id: anyVpc.id,
        subnet_id: anySubnet.id,
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

    // actually set up IPs. looks very similar to validation step but this time
    // we are writing to the DB
    body.external_ips?.forEach((ip) => {
      if (ip.type === 'floating') {
        const floatingIp = lookup.floatingIp({
          project: project.id,
          floatingIp: ip.floating_ip,
        })
        // we've already validated that the IP isn't attached
        floatingIp.instance_id = instanceId
      } else if (ip.type === 'ephemeral') {
        const pool = resolveIpPool(ip.pool)
        const firstAvailableAddress = getIpFromPool(pool)

        db.ephemeralIps.push({
          instance_id: instanceId,
          external_ip: {
            ip: firstAvailableAddress,
            ip_pool_id: pool.id,
            kind: 'ephemeral',
          },
        })
      }
    })

    const newInstance: Json<Api.Instance> = {
      id: instanceId,
      project_id: project.id,
      ...R.pick(body, ['name', 'description', 'hostname', 'memory', 'ncpus']),
      ...getTimestamps(),
      run_state: 'creating',
      time_run_state_updated: new Date().toISOString(),
      boot_disk_id: bootDiskId,
      auto_restart_enabled: true,
    }

    if (body.start) {
      setTimeout(() => {
        newInstance.run_state = 'starting'
      }, 1500)

      setTimeout(() => {
        newInstance.run_state = 'running'
      }, 4000)
    }

    db.instances.push(newInstance)

    return json(newInstance, { status: 201 })
  },
  instanceView: ({ path, query }) => lookup.instance({ ...path, ...query }),
  instanceUpdate({ path, query, body }) {
    const instance = lookup.instance({ ...path, ...query })

    const resize = body.ncpus !== instance.ncpus || body.memory !== instance.memory
    if (resize && !instanceCan.resize({ runState: instance.run_state })) {
      const states = instanceCan.resize.states
      throw `Instance can only be resized if ${commaSeries(states, 'or')}`
    }

    // always present on the body, always set them
    instance.ncpus = body.ncpus
    instance.memory = body.memory

    const rejectSetBootDisk = `Boot disk can only be changed if instance is ${commaSeries(instanceCan.updateBootDisk.states, 'or')}`

    if (body.boot_disk) {
      // Only include project if it's a name, otherwise lookup will error.
      // This will 404 if the disk doesn't exist, which I think is right.
      const disk = lookup.disk({
        disk: body.boot_disk,
        project: isUuid(body.boot_disk) ? undefined : query.project,
      })

      // blow up if we're trying to change the boot disk but instance isn't stopped
      if (
        disk.id !== instance.boot_disk_id &&
        !instanceCan.updateBootDisk({ runState: instance.run_state })
      ) {
        throw rejectSetBootDisk
      }

      const isAttached =
        disk.state.state === 'attached' && disk.state.instance === instance.id
      if (!(diskCan.setAsBootDisk(disk) && isAttached)) {
        throw 'Boot disk must be attached to the instance'
      }

      instance.boot_disk_id = disk.id
    } else {
      // we're clearing the boot disk!

      // if we already have a boot disk, the request is trying to unset it, so blow
      // up if that's not allowed
      if (
        instance.boot_disk_id &&
        !instanceCan.updateBootDisk({ runState: instance.run_state })
      ) {
        throw rejectSetBootDisk
      }
      instance.boot_disk_id = undefined
    }

    // AUTO RESTART

    // null is meaningful: it unsets the value
    instance.auto_restart_policy = body.auto_restart_policy
    instance.cpu_platform = body.cpu_platform

    // We depart here from nexus in that nexus does both of the following
    // calculations at view time (when converting model to view). We can't
    // do that/don't need because our mock DB stores and returns the view
    // representation directly.

    // https://github.com/oxidecomputer/omicron/blob/0c6ab099e/nexus/db-queries/src/db/datastore/instance.rs#L228-L239
    instance.auto_restart_enabled = match(instance.auto_restart_policy)
      .with(null, () => true)
      .with('best_effort', () => true)
      .with('never', () => false)
      .exhaustive()

    // Nexus has something slightly more complicated because it's possible the
    // default cooldown of one hour can be overridden at the instance level, but
    // that is currently only used in tests, so we should assume all instances
    // have the default of 1 hour. It's worth noting this may never come into
    // effect unless we deliberately set time_last_auto_restarted on a mock
    // instance because the mock API has no ability to actually auto-restart
    // an instance.
    // https://github.com/oxidecomputer/omicron/blob/0c6ab099e/nexus/db-queries/src/db/datastore/instance.rs#L206-L226
    instance.auto_restart_cooldown_expiration = instance.time_last_auto_restarted
      ? addHours(instance.time_last_auto_restarted, 1).toISOString()
      : undefined

    return instance
  },
  instanceDelete({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    db.instances = db.instances.filter((i) => i.id !== instance.id)
    // delete instance from any affinity / anti-affinity groups with it as a member
    db.affinityGroupMemberLists = db.affinityGroupMemberLists.filter(
      (member) => member.affinity_group_member.id !== instance.id
    )
    db.antiAffinityGroupMemberLists = db.antiAffinityGroupMemberLists.filter(
      (member) => member.anti_affinity_group_member.id !== instance.id
    )
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
    if (!instanceCan.detachDisk({ runState: instance.run_state })) {
      const states = commaSeries(instanceCan.detachDisk.states, 'or')
      throw `Can only detach disk from instance that is ${states}`
    }
    const disk = lookup.disk({
      disk: body.disk,
      // use instance project ID because project may not be specified in params
      project: isUuid(body.disk) ? undefined : instance.project_id,
    })
    if (!diskCan.detach(disk)) {
      const states = commaSeries(diskCan.detach.states, 'or')
      throw `Can only detach disk that is ${states}`
    }
    disk.state = { state: 'detached' }
    return disk
  },
  instanceEphemeralIpAttach({ path, query: projectParams, body }) {
    const instance = lookup.instance({ ...path, ...projectParams })
    const pool = resolveIpPool(body.pool)
    const ip = getIpFromPool(pool)

    const externalIp = { ip, ip_pool_id: pool.id, kind: 'ephemeral' as const }
    db.ephemeralIps.push({
      instance_id: instance.id,
      external_ip: externalIp,
    })

    return externalIp
  },
  instanceEphemeralIpDetach({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    // match API logic: find/remove first ephemeral ip attached to instance
    // https://github.com/oxidecomputer/omicron/blob/d52aad0/nexus/db-queries/src/db/datastore/external_ip.rs#L782-L794
    // https://github.com/oxidecomputer/omicron/blob/d52aad0/nexus/src/app/sagas/instance_ip_detach.rs#L79-L82
    const ip = db.ephemeralIps.find((eip) => eip.instance_id === instance.id)
    if (!ip) throw notFoundErr(`ephemeral IP for instance ${instance.name}`)
    db.ephemeralIps = db.ephemeralIps.filter((eip) => eip !== ip)
    return 204
  },
  instanceExternalIpList({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })

    const ephemeralIps = db.ephemeralIps
      .filter((eip) => eip.instance_id === instance.id)
      .map((eip) => eip.external_ip)

    const snatIps = db.snatIps
      .filter((sip) => sip.instance_id === instance.id)
      .map((sip) => sip.external_ip)

    // floating IPs are missing their `kind` field in the DB so we add it
    const floatingIps = db.floatingIps
      .filter((f) => f.instance_id === instance.id)
      .map((f) => ({ kind: 'floating' as const, ...f }))

    // endpoint is not paginated. or rather, it's fake paginated
    return { items: [...ephemeralIps, ...snatIps, ...floatingIps] }
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
    updateDesc(nic, body)

    // We used to error here if body.primary was false and nic.primary was true
    // on the grounds that you can't unset the primary interface. But this turns
    // out not to match the real API, which ignores primary: false.
    // https://github.com/oxidecomputer/omicron/blob/61ad056c/nexus/db-queries/src/db/datastore/network_interface.rs?plain=1#L804-L808

    if (typeof body.primary === 'boolean' && body.primary && !nic.primary) {
      db.networkInterfaces
        .filter((n) => n.instance_id === nic.instance_id)
        .forEach((n) => {
          n.primary = false
        })
      nic.primary = !!body.primary
    }

    if (body.transit_ips) {
      nic.transit_ips = body.transit_ips
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
  instanceStart({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    instance.run_state = 'starting'

    setTimeout(() => {
      instance.run_state = 'running'
    }, 3000)

    return json(instance, { status: 202 })
  },
  instanceStop({ path, query }) {
    const instance = lookup.instance({ ...path, ...query })
    instance.run_state = 'stopping'

    setTimeout(() => {
      instance.run_state = 'stopped'
    }, 3000)

    return json(instance, { status: 202 })
  },
  ipPoolList: ({ query }) => paginated(query, db.ipPools),
  ipPoolUtilizationView({ path }) {
    // note: a given pool is either all IPv4 or all IPv6, but the logic is the
    // same. we do everything in bigints and then convert to float at the end,
    // like the API

    const pool = lookup.ipPool(path)

    const allocatedIps = R.pipe(
      [
        ...db.floatingIps.filter((fip) => fip.ip_pool_id === pool.id).map((fip) => fip.ip),
        ...db.ephemeralIps
          .filter((eip) => eip.external_ip.ip_pool_id === pool.id)
          .map((eip) => eip.external_ip.ip),
        ...db.snatIps
          .filter((sip) => sip.external_ip.ip_pool_id === pool.id)
          .map((sip) => sip.external_ip.ip),
      ],
      // Dedupe by IP address since multiple instances can share the same SNAT
      // IP with different port ranges
      R.unique(),
      R.length()
    )

    const ranges = db.ipPoolRanges
      .filter((r) => r.ip_pool_id === pool.id)
      .map((r) => r.range)
    // ipRangeLen returns a bigint, so R.sum will too unless the array is empty,
    // in which case it returns 0. So the fallback is for that case.
    const exactCapacity = R.sum(ranges.map(ipRangeLen)) || 0n
    // always going to be small but also make it a bigint so we can subtract
    const exactRemaining = exactCapacity - BigInt(allocatedIps)

    return {
      capacity: Number(exactCapacity),
      remaining: Number(exactRemaining),
    }
  },
  siloIpPoolList({ path, query }) {
    const pools = lookup.siloIpPools(path)
    return paginated(query, pools)
  },
  projectIpPoolList({ query }) {
    const pools = lookup.siloIpPools({ silo: defaultSilo.id })
    return paginated(query, pools)
  },
  projectIpPoolView: ({ path: { pool } }) =>
    lookup.siloIpPool({ pool, silo: defaultSilo.id }),
  // TODO: require admin permissions for system IP pool endpoints
  ipPoolView: ({ path }) => lookup.ipPool(path),
  ipPoolSiloList({ path /*query*/ }) {
    // TODO: paginated wants an id field, but this is a join table, so it  has a
    // composite pk
    // return paginated(query, db.ipPoolResources)

    const pool = lookup.ipPool(path)
    const assocs = db.ipPoolSilos.filter((ipr) => ipr.ip_pool_id === pool.id)
    return { items: assocs }
  },
  ipPoolSiloLink({ path, body }) {
    const pool = lookup.ipPool(path)
    const silo_id = lookup.silo({ silo: body.silo }).id

    const assoc = {
      ip_pool_id: pool.id,
      silo_id,
      is_default: body.is_default,
    }

    const alreadyThere = db.ipPoolSilos.find(
      (ips) => ips.ip_pool_id === pool.id && ips.silo_id === silo_id
    )

    // TODO: this matches current API logic but makes no sense because is_default
    // could be different. Need to fix that. Should 400 or 409 on conflict.
    if (!alreadyThere) db.ipPoolSilos.push(assoc)

    return assoc
  },
  ipPoolSiloUnlink({ path }) {
    const pool = lookup.ipPool(path)
    const silo = lookup.silo(path)

    // ignore is_default when deleting, it's not part of the pk
    db.ipPoolSilos = db.ipPoolSilos.filter(
      (ips) => !(ips.ip_pool_id === pool.id && ips.silo_id === silo.id)
    )

    return 204
  },
  ipPoolSiloUpdate: ({ path, body }) => {
    const ipPoolSilo = lookup.ipPoolSiloLink(path)

    // if we're setting default, we need to set is_default false on the existing default
    if (body.is_default) {
      const silo = lookup.silo(path)
      const existingDefault = db.ipPoolSilos.find(
        (ips) => ips.silo_id === silo.id && ips.is_default
      )
      if (existingDefault) {
        existingDefault.is_default = false
      }
    }

    ipPoolSilo.is_default = body.is_default

    return ipPoolSilo
  },
  ipPoolRangeList({ path, query }) {
    const pool = lookup.ipPool(path)
    const ranges = db.ipPoolRanges.filter((r) => r.ip_pool_id === pool.id)
    return paginated(query, ranges)
  },
  ipPoolRangeAdd({ path, body }) {
    const pool = lookup.ipPool(path)

    // TODO: reject IPv6 ranges to match API behavior, but designate a special
    // address that will let us bypass that to test IPv6 handling

    const newRange: Json<Api.IpPoolRange> = {
      id: uuid(),
      ip_pool_id: pool.id,
      range: body,
      time_created: new Date().toISOString(),
    }

    // TODO: validate that it doesn't overlap with existing ranges
    db.ipPoolRanges.push(newRange)

    return json(newRange, { status: 201 })
  },
  ipPoolRangeRemove({ path, body }) {
    const pool = lookup.ipPool(path)

    // TODO: use ips in range helpers to refuse to remove a range with IPs
    // outstanding

    const idsToDelete = db.ipPoolRanges
      .filter(
        (r) =>
          r.ip_pool_id === pool.id &&
          r.range.first === body.first &&
          r.range.last === body.last
      )
      .map((r) => r.id)

    // if nothing in the DB matches, 404
    if (idsToDelete.length === 0) throw notFoundErr(`IP range ${body.first}-${body.last}`)

    db.ipPoolRanges = db.ipPoolRanges.filter((r) => !idsToDelete.includes(r.id))

    return 204
  },
  ipPoolCreate({ body }) {
    errIfExists(db.ipPools, { name: body.name }, 'IP pool')

    const newPool: Json<Api.IpPool> = {
      id: uuid(),
      description: body.description,
      name: body.name,
      // It might not be possible to hit this fallback because the zod
      // validator we use to parse this has default('v4') on it. But it also
      // has `optional()` on it, which means the types think it can still be
      // undefined.
      // See https://zod.dev/v4/changelog?id=defaults-applied-within-optional-fields#defaults-applied-within-optional-fields
      ip_version: body.ip_version || 'v4',
      ...getTimestamps(),
    }
    db.ipPools.push(newPool)

    return json(newPool, { status: 201 })
  },
  ipPoolDelete({ path }) {
    const pool = lookup.ipPool(path)

    if (db.ipPoolRanges.some((r) => r.ip_pool_id === pool.id)) {
      throw 'IP pool cannot be deleted while it contains IP ranges'
    }

    // delete pools and silo links
    db.ipPools = db.ipPools.filter((p) => p.id !== pool.id)
    db.ipPoolSilos = db.ipPoolSilos.filter((s) => s.ip_pool_id !== pool.id)

    return 204
  },
  ipPoolUpdate({ path, body }) {
    const pool = lookup.ipPool(path)

    if (body.name) {
      // only check for existing name if it's being changed
      if (body.name !== pool.name) {
        errIfExists(db.ipPools, { name: body.name })
      }
      pool.name = body.name
    }

    updateDesc(pool, body)

    return pool
  },
  projectPolicyView({ path }) {
    const project = lookup.project(path)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
      .map((r) => R.pick(r, ['identity_id', 'identity_type', 'role_name']))

    return { role_assignments }
  },
  projectPolicyUpdate({ body, path }) {
    const project = lookup.project(path)

    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'project' as const,
      resource_id: project.id,
      ...R.pick(r, ['identity_id', 'identity_type', 'role_name']),
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

    if (body.disk === 'disk-snapshot-error') {
      throw 'Cannot snapshot disk'
    }

    errIfExists(db.snapshots, { name: body.name, project_id: project.id })

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
  utilizationView() {
    const { allocated: capacity, provisioned } = utilizationForSilo(defaultSilo)
    return { capacity, provisioned }
  },
  siloUtilizationView({ path }) {
    const silo = lookup.silo(path)
    return utilizationForSilo(silo)
  },
  siloUtilizationList({ query }) {
    const { items: silos, nextPage } = paginated(query, db.silos)
    return {
      items: silos.map(utilizationForSilo),
      nextPage,
    }
  },
  vpcList({ query }) {
    const project = lookup.project(query)
    const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
    return paginated(query, vpcs)
  },
  vpcCreate({ body, query }) {
    const project = lookup.project(query)
    errIfExists(db.vpcs, { name: body.name, project_id: project.id })

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

    // populate default firewall rules
    db.vpcFirewallRules.push(...defaultFirewallRules(newVpc.id))

    return json(newVpc, { status: 201 })
  },
  vpcView: ({ path, query }) => lookup.vpc({ ...path, ...query }),
  vpcUpdate({ body, path, query }) {
    const vpc = lookup.vpc({ ...path, ...query })

    if (body.name) {
      vpc.name = body.name
    }

    updateDesc(vpc, body)

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

    return 204
  },
  vpcFirewallRulesView({ query }) {
    const vpc = lookup.vpc(query)
    const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)

    return { rules: R.sortBy(rules, (r) => r.name) }
  },
  vpcFirewallRulesUpdate({ body, query }) {
    const vpc = lookup.vpc(query)

    const rules = (body.rules ?? []).map((rule) => ({
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

    return { rules: R.sortBy(rules, (r) => r.name) }
  },
  internetGatewayList({ query }) {
    const vpc = lookup.vpc(query)
    const gateways = db.internetGateways.filter((g) => g.vpc_id === vpc.id)
    return paginated(query, gateways)
  },
  internetGatewayView: ({ path, query }) => lookup.internetGateway({ ...path, ...query }),
  internetGatewayIpPoolList({ query }) {
    const gateway = lookup.internetGateway(query)
    const pools = db.internetGatewayIpPools.filter(
      (p) => p.internet_gateway_id === gateway.id
    )
    return paginated(query, pools)
  },
  internetGatewayIpAddressList({ query }) {
    const gateway = lookup.internetGateway(query)
    const addresses = db.internetGatewayIpAddresses.filter(
      (a) => a.internet_gateway_id === gateway.id
    )
    return paginated(query, addresses)
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
      // Error if changing the router name and that router name already exists
      if (body.name !== router.name) {
        errIfExists(db.vpcRouters, {
          vpc_id: router.vpc_id,
          name: body.name,
        })
      }
      router.name = body.name
    }
    updateDesc(router, body)
    return router
  },
  vpcRouterDelete({ path, query }) {
    const router = lookup.vpcRouter({ ...path, ...query })
    db.vpcRouters = db.vpcRouters.filter((r) => r.id !== router.id)
    return 204
  },
  vpcRouterRouteList: ({ query }) => {
    const { project, router, vpc } = query
    const vpcRouter = lookup.vpcRouter({ project, router, vpc })
    const routes = db.vpcRouterRoutes.filter((r) => r.vpc_router_id === vpcRouter.id)
    return paginated(query, routes)
  },
  vpcRouterRouteCreate({ body, query }) {
    const vpcRouter = lookup.vpcRouter(query)
    errIfExists(db.vpcRouterRoutes, { vpc_router_id: vpcRouter.id, name: body.name })
    const newRoute: Json<Api.RouterRoute> = {
      id: uuid(),
      vpc_router_id: vpcRouter.id,
      kind: 'custom',
      ...body,
      ...getTimestamps(),
    }
    db.vpcRouterRoutes.push(newRoute)
    return json(newRoute, { status: 201 })
  },
  vpcRouterRouteView: ({ path, query }) => lookup.vpcRouterRoute({ ...path, ...query }),
  vpcRouterRouteUpdate({ body, path, query }) {
    const route = lookup.vpcRouterRoute({ ...path, ...query })
    if (body.name) {
      // Error if changing the route name and that route name already exists
      if (body.name !== route.name) {
        errIfExists(db.vpcRouterRoutes, {
          vpc_router_id: route.vpc_router_id,
          name: body.name,
        })
      }
      route.name = body.name
    }
    updateDesc(route, body)
    if (body.destination) {
      route.destination = body.destination
    }
    if (body.target) {
      route.target = body.target
    }
    return route
  },
  vpcRouterRouteDelete: ({ path, query }) => {
    const route = lookup.vpcRouterRoute({ ...path, ...query })
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
      name: body.name,
      description: body.description,
      ipv4_block: body.ipv4_block,
      custom_router_id: body.custom_router,
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
    updateDesc(subnet, body)

    // match the API's arguably undesirable behavior -- key
    // not present and value of null are treated the same
    subnet.custom_router_id = body.custom_router

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
  sledPhysicalDiskList({ path, query, cookies }) {
    requireFleetViewer(cookies)
    const sled = lookup.sled(path)
    const disks = db.physicalDisks.filter((n) => n.sled_id === sled.id)
    return paginated(query, disks)
  },
  physicalDiskList({ query, cookies }) {
    requireFleetViewer(cookies)
    return paginated(query, db.physicalDisks)
  },
  policyView() {
    // assume we're in the default silo
    const siloId = defaultSilo.id
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'silo' && r.resource_id === siloId)
      .map((r) => R.pick(r, ['identity_id', 'identity_type', 'role_name']))

    return { role_assignments }
  },
  policyUpdate({ body }) {
    const siloId = defaultSilo.id
    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'silo' as const,
      resource_id: siloId,
      ...R.pick(r, ['identity_id', 'identity_type', 'role_name']),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'silo' && r.resource_id === siloId)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return body
  },
  // assume every silo has a settings entry in both of these
  authSettingsUpdate({ body }) {
    const settings = db.siloSettings.find((s) => s.silo_id === defaultSilo.id)!
    settings.device_token_max_ttl_seconds = body.device_token_max_ttl_seconds
    return settings
  },
  authSettingsView() {
    return db.siloSettings.find((s) => s.silo_id === defaultSilo.id)!
  },
  rackList: ({ query, cookies }) => {
    requireFleetViewer(cookies)
    return paginated(query, db.racks)
  },
  currentUserView({ cookies }) {
    const user = currentUser(cookies)
    return {
      ...user,
      silo_name: defaultSilo.name,
      fleet_viewer: userHasRole(user, 'fleet', FLEET_ID, 'viewer'),
      silo_admin: userHasRole(user, 'silo', defaultSilo.id, 'admin'),
    }
  },
  currentUserGroups({ cookies }) {
    const user = currentUser(cookies)
    const memberships = db.groupMemberships.filter((gm) => gm.userId === user.id)
    const groupIds = new Set(memberships.map((gm) => gm.groupId))
    const groups = db.userGroups.filter((g) => groupIds.has(g.id))
    return { items: groups }
  },
  currentUserSshKeyList({ query, cookies }) {
    const user = currentUser(cookies)
    const keys = db.sshKeys.filter((k) => k.silo_user_id === user.id)
    return paginated(query, keys)
  },
  currentUserSshKeyCreate({ body, cookies }) {
    const user = currentUser(cookies)
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
  currentUserAccessTokenDelete({ path }) {
    db.deviceTokens = db.deviceTokens.filter((token) => token.id !== path.tokenId)
    return 204
  },
  currentUserAccessTokenList: ({ query }) => paginated(query, db.deviceTokens),
  sledView({ path, cookies }) {
    requireFleetViewer(cookies)
    return lookup.sled(path)
  },
  sledList({ query, cookies }) {
    requireFleetViewer(cookies)
    return paginated(query, db.sleds)
  },
  sledInstanceList({ query, path, cookies }) {
    requireFleetViewer(cookies)
    const sled = lookupById(db.sleds, path.sledId)
    return paginated(
      query,
      db.instances.map((i) => {
        const project = lookupById(db.projects, i.project_id)
        return {
          ...R.pick(i, ['id', 'name', 'time_created', 'time_modified', 'memory', 'ncpus']),
          state: 'running',
          active_sled_id: sled.id,
          project_name: project.name,
          silo_name: defaultSilo.name,
        }
      })
    )
  },
  siloList({ query, cookies }) {
    requireFleetViewer(cookies)
    return paginated(query, db.silos)
  },
  siloCreate({ body: { quotas, ...body }, cookies }) {
    requireFleetViewer(cookies)
    errIfExists(db.silos, { name: body.name })
    const newSilo: Json<Api.Silo> = {
      id: uuid(),
      ...getTimestamps(),
      ...body,
      mapped_fleet_roles: body.mapped_fleet_roles || {},
    }
    db.silos.push(newSilo)
    db.siloQuotas.push({ silo_id: newSilo.id, ...quotas })
    db.siloProvisioned.push({ silo_id: newSilo.id, cpus: 0, memory: 0, storage: 0 })
    db.siloSettings.push({ silo_id: newSilo.id, device_token_max_ttl_seconds: null })
    return json(newSilo, { status: 201 })
  },
  siloView({ path, cookies }) {
    requireFleetViewer(cookies)
    return lookup.silo(path)
  },
  siloDelete({ path, cookies }) {
    requireFleetViewer(cookies)
    const silo = lookup.silo(path)
    db.silos = db.silos.filter((i) => i.id !== silo.id)
    db.ipPoolSilos = db.ipPoolSilos.filter((i) => i.silo_id !== silo.id)
    db.siloSettings = db.siloSettings.filter((i) => i.silo_id !== silo.id)
    return 204
  },
  siloIdentityProviderList({ query, cookies }) {
    requireFleetViewer(cookies)
    const silo = lookup.silo(query)
    const idps = db.identityProviders.filter(({ siloId }) => siloId === silo.id).map(toIdp)
    return { items: idps }
  },
  siloQuotasUpdate({ body, path, cookies }) {
    requireFleetCollab(cookies)
    const quotas = lookup.siloQuotas(path)

    if (body.cpus != null) quotas.cpus = body.cpus
    if (body.memory != null) quotas.memory = body.memory
    if (body.storage != null) quotas.storage = body.storage

    return quotas
  },
  siloQuotasView({ path, cookies }) {
    requireFleetViewer(cookies)
    return lookup.siloQuotas(path)
  },
  samlIdentityProviderCreate({ query, body, cookies }) {
    requireFleetViewer(cookies)
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
      ...R.pick(body, [
        'name',
        'acs_url',
        'description',
        'idp_entity_id',
        'slo_url',
        'sp_client_id',
        'technical_contact_email',
      ]),
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

  switchList: ({ query, cookies }) => {
    requireFleetViewer(cookies)
    return paginated(query, db.switches)
  },

  systemPolicyView({ cookies }) {
    requireFleetViewer(cookies)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'fleet' && r.resource_id === FLEET_ID)
      .map((r) => R.pick(r, ['identity_id', 'identity_type', 'role_name']))

    return { role_assignments }
  },
  systemMetric(params) {
    requireFleetViewer(params.cookies)
    return handleMetrics(params)
  },
  async timeseriesQuery({ body, query }) {
    lookup.project(query) // 404 if project doesn't exist

    // We could try to do something analogous to what the API does, namely
    // adding on silo and project to the oxql query to make sure only allowed
    // data turns up, but since this endpoint is always called from within a
    // project and constructed with project IDs, this would be unlikely to catch
    // console bugs.
    // https://github.com/oxidecomputer/omicron/blob/cf38148d/nexus/src/app/metrics.rs#L154-L179

    // timeseries queries are slower than most other queries
    await delay(1000)
    const data = handleOxqlMetrics(body)

    // we use other-project to test certain response cases
    if (query.project === 'other-project') {
      // 1. return only one data point
      const points = data.tables[0].timeseries[0].points
      if (body.query.includes('state == "run"')) {
        points.timestamps = points.timestamps.slice(0, 2)
        points.values = points.values.slice(0, 2)
      } else if (body.query.includes('state == "emulation"')) {
        points.timestamps = points.timestamps.slice(0, 1)
        points.values = points.values.slice(0, 1)
      } else if (body.query.includes('state == "idle"')) {
        throw OXQL_GROUP_BY_ERROR
      }
    }

    return data
  },
  async systemTimeseriesQuery({ cookies, body }) {
    requireFleetViewer(cookies)
    // timeseries queries are slower than most other queries
    await delay(1000)
    return handleOxqlMetrics(body)
  },
  siloMetric: handleMetrics,
  affinityGroupList: ({ query }) => {
    const project = lookup.project({ ...query })
    const affinityGroups = db.affinityGroups.filter((i) => i.project_id === project.id)
    return paginated(query, affinityGroups)
  },
  affinityGroupView: ({ path, query }) => lookup.affinityGroup({ ...path, ...query }),
  affinityGroupMemberList: ({ path, query }) => {
    const affinityGroup = lookup.affinityGroup({ ...path, ...query })
    const members: Json<AffinityGroupMember>[] = db.affinityGroupMemberLists
      .filter((i) => i.affinity_group_id === affinityGroup.id)
      .map((i) => {
        const { id, name, run_state } = lookup.instance({
          instance: i.affinity_group_member.id,
        })
        return { type: 'instance', value: { id, name, run_state } }
      })
    return { items: members }
  },
  antiAffinityGroupCreate(params) {
    const project = lookup.project(params.query)
    errIfExists(db.antiAffinityGroups, { name: params.body.name, project_id: project.id })

    const newAntiAffinityGroup: Json<Api.AntiAffinityGroup> = {
      id: uuid(),
      project_id: project.id,
      ...params.body,
      ...getTimestamps(),
    }
    db.antiAffinityGroups.push(newAntiAffinityGroup)

    return json(newAntiAffinityGroup, { status: 201 })
  },
  antiAffinityGroupUpdate({ body, path, query }) {
    const antiAffinityGroup = lookup.antiAffinityGroup({ ...path, ...query })
    if (body.name) {
      // Error if changing the group name and that group name already exists
      if (body.name !== antiAffinityGroup.name) {
        errIfExists(db.antiAffinityGroups, {
          project_id: antiAffinityGroup.project_id,
          name: body.name,
        })
      }
      antiAffinityGroup.name = body.name
    }
    updateDesc(antiAffinityGroup, body)
    return antiAffinityGroup
  },
  antiAffinityGroupList: ({ query }) => {
    const project = lookup.project({ ...query })
    const antiAffinityGroups = db.antiAffinityGroups.filter(
      (i) => i.project_id === project.id
    )
    return paginated(query, antiAffinityGroups)
  },
  antiAffinityGroupView: ({ path, query }) =>
    lookup.antiAffinityGroup({ ...path, ...query }),
  antiAffinityGroupDelete: ({ path, query }) => {
    const group = lookup.antiAffinityGroup({ ...path, ...query })
    db.antiAffinityGroups = db.antiAffinityGroups.filter((i) => i.id !== group.id)
    return 204
  },
  antiAffinityGroupMemberList: ({ path, query }) => {
    const antiAffinityGroup = lookup.antiAffinityGroup({ ...path, ...query })
    const members: Json<AntiAffinityGroupMember>[] = db.antiAffinityGroupMemberLists
      .filter((i) => i.anti_affinity_group_id === antiAffinityGroup.id)
      .map((i) => {
        const { id, name, run_state } = lookup.instance({
          instance: i.anti_affinity_group_member.id,
        })
        return { type: 'instance', value: { id, name, run_state } }
      })
    return { items: members }
  },
  antiAffinityGroupMemberInstanceAdd({ path, query }) {
    const project = lookup.project({ ...query })
    const instance = lookup.instance({ ...query, instance: path.instance })
    const antiAffinityGroup = lookup.antiAffinityGroup({
      project: project.id,
      antiAffinityGroup: path.antiAffinityGroup,
    })
    const alreadyThere = db.antiAffinityGroupMemberLists.some(
      (i) =>
        i.anti_affinity_group_id === antiAffinityGroup.id &&
        i.anti_affinity_group_member.id === instance.id
    )
    if (alreadyThere) {
      throw 'Instance already in anti-affinity group'
    }
    const newMember: Json<Api.AntiAffinityGroupMember> = {
      type: 'instance',
      value: {
        id: instance.id,
        name: instance.name,
        run_state: instance.run_state,
      },
    }
    db.antiAffinityGroupMemberLists.push({
      anti_affinity_group_id: antiAffinityGroup.id,
      anti_affinity_group_member: { type: 'instance', id: instance.id },
    })
    return json(newMember, { status: 201 })
  },
  antiAffinityGroupMemberInstanceDelete: ({ path, query }) => {
    const project = lookup.project({ ...query })
    const instance = lookup.instance({ ...query, instance: path.instance })
    const antiAffinityGroup = lookup.antiAffinityGroup({
      project: project.id,
      antiAffinityGroup: path.antiAffinityGroup,
    })
    db.antiAffinityGroupMemberLists = db.antiAffinityGroupMemberLists.filter(
      (i) =>
        i.anti_affinity_group_id !== antiAffinityGroup.id ||
        i.anti_affinity_group_member.id !== instance.id
    )
    return 204
  },
  instanceAntiAffinityGroupList: ({ path, query }) => {
    const instance = lookup.instance({ ...path, ...query })
    const antiAffinityGroups = db.antiAffinityGroups.filter((group) =>
      db.antiAffinityGroupMemberLists.some(
        (member) =>
          member.anti_affinity_group_id === group.id &&
          member.anti_affinity_group_member.id === instance.id
      )
    )
    return paginated(query, antiAffinityGroups)
  },
  instanceAffinityGroupList: ({ path, query }) => {
    const instance = lookup.instance({ ...path, ...query })
    const affinityGroups = db.affinityGroups.filter((group) =>
      db.affinityGroupMemberLists.some(
        (member) =>
          member.affinity_group_id === group.id &&
          member.affinity_group_member.id === instance.id
      )
    )
    return paginated(query, affinityGroups)
  },

  // Misc endpoints we're not using yet in the console
  affinityGroupCreate: NotImplemented,
  affinityGroupDelete: NotImplemented,
  affinityGroupMemberInstanceAdd: NotImplemented,
  affinityGroupMemberInstanceDelete: NotImplemented,
  affinityGroupMemberInstanceView: NotImplemented,
  affinityGroupUpdate: NotImplemented,
  scimTokenCreate: NotImplemented,
  scimTokenDelete: NotImplemented,
  scimTokenDeleteAll: NotImplemented,
  scimTokenList: NotImplemented,
  scimTokenView: NotImplemented,
  alertClassList: NotImplemented,
  alertDeliveryList: NotImplemented,
  alertDeliveryResend: NotImplemented,
  alertReceiverDelete: NotImplemented,
  alertReceiverList: NotImplemented,
  alertReceiverProbe: NotImplemented,
  alertReceiverSubscriptionAdd: NotImplemented,
  alertReceiverSubscriptionRemove: NotImplemented,
  alertReceiverView: NotImplemented,
  antiAffinityGroupMemberInstanceView: NotImplemented,
  auditLogList: NotImplemented,
  certificateCreate: NotImplemented,
  certificateDelete: NotImplemented,
  certificateList: NotImplemented,
  certificateView: NotImplemented,
  instanceSerialConsole: NotImplemented,
  instanceSerialConsoleStream: NotImplemented,
  instanceSshPublicKeyList: NotImplemented,
  internetGatewayCreate: NotImplemented,
  internetGatewayDelete: NotImplemented,
  internetGatewayIpAddressCreate: NotImplemented,
  internetGatewayIpAddressDelete: NotImplemented,
  internetGatewayIpPoolCreate: NotImplemented,
  internetGatewayIpPoolDelete: NotImplemented,
  ipPoolServiceRangeAdd: NotImplemented,
  ipPoolServiceRangeList: NotImplemented,
  ipPoolServiceRangeRemove: NotImplemented,
  ipPoolServiceView: NotImplemented,
  localIdpUserCreate: NotImplemented,
  localIdpUserDelete: NotImplemented,
  localIdpUserSetPassword: NotImplemented,
  loginSaml: NotImplemented,
  networkingAddressLotBlockList: NotImplemented,
  networkingAddressLotCreate: NotImplemented,
  networkingAddressLotDelete: NotImplemented,
  networkingAddressLotList: NotImplemented,
  networkingAddressLotView: NotImplemented,
  networkingAllowListUpdate: NotImplemented,
  networkingAllowListView: NotImplemented,
  networkingBfdDisable: NotImplemented,
  networkingBfdEnable: NotImplemented,
  networkingBfdStatus: NotImplemented,
  networkingBgpAnnounceSetDelete: NotImplemented,
  networkingBgpAnnounceSetList: NotImplemented,
  networkingBgpAnnounceSetUpdate: NotImplemented,
  networkingBgpAnnouncementList: NotImplemented,
  networkingBgpConfigCreate: NotImplemented,
  networkingBgpConfigDelete: NotImplemented,
  networkingBgpConfigList: NotImplemented,
  networkingBgpExported: NotImplemented,
  networkingBgpImportedRoutesIpv4: NotImplemented,
  networkingBgpMessageHistory: NotImplemented,
  networkingBgpStatus: NotImplemented,
  networkingInboundIcmpUpdate: NotImplemented,
  networkingInboundIcmpView: NotImplemented,
  networkingLoopbackAddressCreate: NotImplemented,
  networkingLoopbackAddressDelete: NotImplemented,
  networkingLoopbackAddressList: NotImplemented,
  networkingSwitchPortApplySettings: NotImplemented,
  networkingSwitchPortClearSettings: NotImplemented,
  networkingSwitchPortList: NotImplemented,
  networkingSwitchPortLldpConfigUpdate: NotImplemented,
  networkingSwitchPortLldpConfigView: NotImplemented,
  networkingSwitchPortLldpNeighbors: NotImplemented,
  networkingSwitchPortSettingsCreate: NotImplemented,
  networkingSwitchPortSettingsDelete: NotImplemented,
  networkingSwitchPortSettingsList: NotImplemented,
  networkingSwitchPortSettingsView: NotImplemented,
  networkingSwitchPortStatus: NotImplemented,
  physicalDiskView: NotImplemented,
  probeCreate: NotImplemented,
  probeDelete: NotImplemented,
  probeList: NotImplemented,
  probeView: NotImplemented,
  rackView: NotImplemented,
  siloPolicyUpdate: NotImplemented,
  siloPolicyView: NotImplemented,
  siloUserList: NotImplemented,
  siloUserView: NotImplemented,
  sledAdd: NotImplemented,
  sledListUninitialized: NotImplemented,
  sledSetProvisionPolicy: NotImplemented,
  supportBundleCreate: NotImplemented,
  supportBundleDelete: NotImplemented,
  supportBundleDownload: NotImplemented,
  supportBundleDownloadFile: NotImplemented,
  supportBundleHead: NotImplemented,
  supportBundleHeadFile: NotImplemented,
  supportBundleIndex: NotImplemented,
  supportBundleList: NotImplemented,
  supportBundleUpdate: NotImplemented,
  supportBundleView: NotImplemented,
  switchView: NotImplemented,
  systemPolicyUpdate: NotImplemented,
  systemQuotasList: NotImplemented,
  systemTimeseriesSchemaList: NotImplemented,
  systemUpdateGetRepository: NotImplemented,
  systemUpdatePutRepository: NotImplemented,
  systemUpdateTrustRootCreate: NotImplemented,
  systemUpdateTrustRootDelete: NotImplemented,
  systemUpdateTrustRootList: NotImplemented,
  systemUpdateTrustRootView: NotImplemented,
  targetReleaseUpdate: NotImplemented,
  targetReleaseView: NotImplemented,
  userBuiltinList: NotImplemented,
  userBuiltinView: NotImplemented,
  userLogout: NotImplemented,
  userSessionList: NotImplemented,
  userTokenList: NotImplemented,
  userView: NotImplemented,
  webhookReceiverCreate: NotImplemented,
  webhookReceiverUpdate: NotImplemented,
  webhookSecretsAdd: NotImplemented,
  webhookSecretsDelete: NotImplemented,
  webhookSecretsList: NotImplemented,
})
