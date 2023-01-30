import { v4 as uuid } from 'uuid'

import type { ApiTypes as Api, UpdateDeployment } from '@oxide/api'
import type { Json } from '@oxide/gen/msw-handlers'
import { json, makeHandlers } from '@oxide/gen/msw-handlers'
import { pick, sortBy } from '@oxide/util'

import { genCumulativeI64Data } from '../metrics'
import { FLEET_ID } from '../role-assignment'
import { serial } from '../serial'
import { defaultSilo, toIdp } from '../silo'
import { sortBySemverDesc } from '../update'
import { user1 } from '../user'
import {
  db,
  lookupById,
  lookupDisk,
  lookupGlobalImage,
  lookupImage,
  lookupInstance,
  lookupNetworkInterface,
  lookupOrg,
  lookupProject,
  lookupSamlIdp,
  lookupSilo,
  lookupSnapshot,
  lookupSshKey,
  lookupSystemUpdate,
  lookupVpc,
  lookupVpcRouter,
  lookupVpcRouterRoute,
  lookupVpcSubnet,
} from './db'
import {
  NotImplemented,
  errIfExists,
  errIfInvalidDiskSize,
  getStartAndEndTime,
  getTimestamps,
  paginated,
  unavailableErr,
} from './util'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

export const handlers = makeHandlers({
  deviceAuthRequest: () => 200,
  deviceAuthConfirm: () => 200,
  deviceAccessToken: () => 200,
  groupList: (params) => paginated(params.query, db.userGroups),

  organizationList: (params) => paginated(params.query, db.orgs),
  organizationCreate({ body }) {
    errIfExists(db.orgs, { name: body.name })

    const newOrg: Json<Api.Organization> = {
      id: uuid(),
      ...body,
      ...getTimestamps(),
    }
    db.orgs.push(newOrg)

    return json(newOrg, { status: 201 })
  },
  organizationView(params) {
    if (params.path.orgName.endsWith('-error-503')) {
      throw unavailableErr
    }

    return lookupOrg(params.path)
  },
  organizationUpdate({ body, ...params }) {
    const org = lookupOrg(params.path)

    if (typeof body.name === 'string') {
      org.name = body.name
    }
    org.description = body.description || ''

    return org
  },
  organizationDelete(params) {
    const org = lookupOrg(params.path)
    db.orgs = db.orgs.filter((o) => o.id !== org.id)
    return 204
  },
  organizationPolicyView(params) {
    const org = lookupOrg(params.path)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'organization' && r.resource_id === org.id)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  organizationPolicyUpdate({ body, ...params }) {
    const org = lookupOrg(params.path)

    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'organization' as const,
      resource_id: org.id,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'organization' && r.resource_id === org.id)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return body
  },
  projectList(params) {
    const org = lookupOrg(params.path)
    const projects = db.projects.filter((p) => p.organization_id === org.id)

    return paginated(params.query, projects)
  },
  projectCreate({ body, ...params }) {
    const org = lookupOrg(params.path)
    errIfExists(db.projects, { name: body.name, organization_id: org.id })

    const newProject: Json<Api.Project> = {
      id: uuid(),
      organization_id: org.id,
      ...body,
      ...getTimestamps(),
    }
    db.projects.push(newProject)

    return json(newProject, { status: 201 })
  },
  projectView: (params) => lookupProject(params.path),
  projectUpdate({ body, ...params }) {
    const project = lookupProject(params.path)
    if (body.name) {
      project.name = body.name
    }
    project.description = body.description || ''

    return project
  },
  projectDelete(params) {
    const project = lookupProject(params.path)

    db.projects = db.projects.filter((p) => p.id !== project.id)

    return 204
  },
  diskList(params) {
    const project = lookupProject(params.path)
    const disks = db.disks.filter((d) => d.project_id === project.id)

    return paginated(params.query, disks)
  },
  diskCreate({ body, ...params }) {
    const project = lookupProject(params.path)

    errIfExists(db.disks, { name: body.name, project_id: project.id })

    const { name, description, size, disk_source } = body
    const newDisk: Json<Api.Disk> = {
      id: uuid(),
      project_id: project.id,
      state: { state: 'creating' },
      device_path: '/mnt/disk',
      name,
      description,
      size,
      // TODO: for non-blank disk sources, look up image or snapshot by ID and
      // pull block size from there
      block_size: disk_source.type === 'blank' ? disk_source.block_size : 4096,
      ...getTimestamps(),
    }
    db.disks.push(newDisk)

    return json(newDisk, { status: 201 })
  },
  diskView: (params) => lookupDisk(params.path),
  diskDelete(params) {
    const disk = lookupDisk(params.path)

    // Governed by https://github.com/oxidecomputer/omicron/blob/e5704d7f343fa0633751527dedf276409647ad4e/nexus/src/db/datastore.rs#L2103
    switch (disk.state.state) {
      case 'creating':
      case 'detached':
      case 'faulted':
        break
      default:
        throw 'Cannot delete disk in state ' + disk.state.state
    }
    db.disks = db.disks.filter((d) => d.id !== disk.id)
    return 204
  },
  diskMetricsList(params) {
    lookupDisk(params.path)

    const { startTime, endTime } = getStartAndEndTime(params.query)

    if (endTime <= startTime) return { items: [] }

    return {
      items: genCumulativeI64Data(
        new Array(1000).fill(0).map((_x, i) => Math.floor(Math.tanh(i / 500) * 3000)),
        startTime,
        endTime
      ),
    }
  },
  imageList(params) {
    const project = lookupProject(params.path)
    const images = db.images.filter((i) => i.project_id === project.id)
    return paginated(params.query, images)
  },
  imageCreate({ body, ...params }) {
    const project = lookupProject(params.path)
    errIfExists(db.images, { name: body.name, project_id: project.id })

    const newImage: Json<Api.Image> = {
      id: uuid(),
      project_id: project.id,
      // TODO: This should be calculated based off of the source
      size: 100,
      ...body,
      ...getTimestamps(),
    }
    db.images.push(newImage)
    return json(newImage, { status: 201 })
  },
  imageView: (params) => lookupImage(params.path),
  imageDelete(params) {
    const image = lookupImage(params.path)
    db.images = db.images.filter((i) => i.id !== image.id)

    return 204
  },
  instanceList(params) {
    const project = lookupProject(params.path)
    const instances = db.instances.filter((i) => i.project_id === project.id)
    return paginated(params.query, instances)
  },
  instanceCreate({ body, ...params }) {
    const project = lookupProject(params.path)

    errIfExists(db.instances, { name: body.name, project_id: project.id })

    const instanceId = uuid()

    /**
     * Eagerly check for disk errors. Execution will stop early and prevent orphaned disks from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    for (const diskParams of body.disks || []) {
      if (diskParams.type === 'create') {
        errIfExists(db.disks, { name: diskParams.name, project_id: project.id })
        errIfInvalidDiskSize(params.path, diskParams)
      } else {
        lookupDisk({ ...params.path, diskName: diskParams.name })
      }
    }

    /**
     * Eagerly check for nic lookup failures. Execution will stop early and prevent orphaned nics from
     * being created if there's a failure. In omicron this is done automatically via an undo on the saga.
     */
    if (body.network_interfaces?.type === 'create') {
      body.network_interfaces.params.forEach(({ vpc_name, subnet_name }) => {
        lookupVpc({ ...params.path, vpcName: vpc_name })
        lookupVpcSubnet({
          ...params.path,
          vpcName: vpc_name,
          subnetName: subnet_name,
        })
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
        const disk = lookupDisk({ ...params.path, diskName: diskParams.name })
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
            vpc_id: lookupVpc({ ...params.path, vpcName: vpc_name }).id,
            subnet_id: lookupVpcSubnet({
              ...params.path,
              vpcName: vpc_name,
              subnetName: subnet_name,
            }).id,
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
  instanceView: (params) => lookupInstance(params.path),
  instanceDelete(params) {
    const instance = lookupInstance(params.path)
    db.instances = db.instances.filter((i) => i.id !== instance.id)
    return 204
  },
  instanceDiskList(params) {
    const instance = lookupInstance(params.path)
    // TODO: Should disk instance state be `instance_id` instead of `instance`?
    const disks = db.disks.filter(
      (d) => 'instance' in d.state && d.state.instance === instance.id
    )
    return paginated(params.query, disks)
  },
  instanceDiskAttach({ body, ...params }) {
    const instance = lookupInstance(params.path)
    if (instance.run_state !== 'stopped') {
      throw 'Cannot attach disk to instance that is not stopped'
    }
    const disk = lookupDisk({ ...params.path, diskName: body.name })
    disk.state = {
      state: 'attached',
      instance: instance.id,
    }
    return disk
  },
  instanceDiskDetach({ body, ...params }) {
    const instance = lookupInstance(params.path)
    if (instance.run_state !== 'stopped') {
      throw 'Cannot detach disk to instance that is not stopped'
    }
    const disk = lookupDisk({ ...params.path, diskName: body.name })
    disk.state = {
      state: 'detached',
    }
    return disk
  },
  instanceExternalIpList(params) {
    lookupInstance(params.path)

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
  instanceNetworkInterfaceList(params) {
    const instance = lookupInstance(params.path)
    const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
    return paginated(params.query, nics)
  },
  instanceNetworkInterfaceCreate({ body, ...params }) {
    const instance = lookupInstance(params.path)
    const nicsForInstance = db.networkInterfaces.filter(
      (n) => n.instance_id === instance.id
    )
    errIfExists(nicsForInstance, { name: body.name })

    const { name, description, subnet_name, vpc_name, ip } = body

    const vpc = lookupVpc({ ...params.path, vpcName: vpc_name })

    const subnet = lookupVpcSubnet({
      ...params.path,
      vpcName: vpc_name,
      subnetName: subnet_name,
    })

    const newNic: Json<Api.NetworkInterface> = {
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
  instanceNetworkInterfaceView: (params) => lookupNetworkInterface(params.path),
  instanceNetworkInterfaceUpdate({ body, ...params }) {
    const nic = lookupNetworkInterface(params.path)

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
  instanceNetworkInterfaceDelete(params) {
    const nic = lookupNetworkInterface(params.path)
    db.networkInterfaces = db.networkInterfaces.filter((n) => n.id !== nic.id)
    return 204
  },
  instanceReboot(params) {
    const instance = lookupInstance(params.path)
    instance.run_state = 'rebooting'

    setTimeout(() => {
      instance.run_state = 'running'
    }, 3000)

    return json(instance, { status: 202 })
  },
  instanceSerialConsole(_params) {
    // TODO: Add support for params
    return serial
  },
  instanceStart(params) {
    const instance = lookupInstance(params.path)
    instance.run_state = 'running'

    return json(instance, { status: 202 })
  },
  instanceStop(params) {
    const instance = lookupInstance(params.path)
    instance.run_state = 'stopped'

    return json(instance, { status: 202 })
  },
  projectPolicyView(params) {
    const project = lookupProject(params.path)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  projectPolicyUpdate({ body, ...params }) {
    const project = lookupProject(params.path)

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
    const project = lookupProject(params.path)
    const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
    return paginated(params.query, snapshots)
  },
  snapshotCreate({ body, ...params }) {
    const project = lookupProject(params.path)

    errIfExists(db.snapshots, { name: body.name })

    const disk = lookupDisk({ ...params.path, diskName: body.disk })

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
  snapshotView: (params) => lookupSnapshot(params.path),
  snapshotDelete(params) {
    const snapshot = lookupSnapshot(params.path)
    db.snapshots = db.snapshots.filter((s) => s.id !== snapshot.id)
    return 204
  },
  vpcList(params) {
    const project = lookupProject(params.path)
    const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
    return paginated(params.query, vpcs)
  },
  vpcCreate({ body, ...params }) {
    const project = lookupProject(params.path)
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
  vpcView: (params) => lookupVpc(params.path),
  vpcUpdate({ body, ...params }) {
    const vpc = lookupVpc(params.path)

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
  vpcDelete(params) {
    const vpc = lookupVpc(params.path)

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
  vpcFirewallRulesView(params) {
    const vpc = lookupVpc(params.path)
    const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)

    return { rules: sortBy(rules, (r) => r.name) }
  },
  vpcFirewallRulesUpdate({ body, ...params }) {
    const vpc = lookupVpc(params.path)

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
  vpcRouterList(params) {
    const vpc = lookupVpc(params.path)
    const routers = db.vpcRouters.filter((r) => r.vpc_id === vpc.id)
    return paginated(params.query, routers)
  },
  vpcRouterCreate({ body, ...params }) {
    const vpc = lookupVpc(params.path)
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
  vpcRouterView: (params) => lookupVpcRouter(params.path),
  vpcRouterUpdate({ body, ...params }) {
    const router = lookupVpcRouter(params.path)

    if (body.name) {
      router.name = body.name
    }
    if (typeof body.description === 'string') {
      router.description = body.description
    }

    return router
  },
  vpcRouterDelete(params) {
    const router = lookupVpcRouter(params.path)

    // TODO: Are there routers that can't be deleted?
    db.vpcRouters = db.vpcRouters.filter((r) => r.id !== router.id)

    return 204
  },
  vpcRouterRouteList(params) {
    const router = lookupVpcRouter(params.path)
    const routers = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
    return paginated(params.query, routers)
  },
  vpcRouterRouteCreate({ body, ...params }) {
    const router = lookupVpcRouter(params.path)

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
  vpcRouterRouteView: (params) => lookupVpcRouterRoute(params.path),
  vpcRouterRouteUpdate({ body, ...params }) {
    const route = lookupVpcRouterRoute(params.path)
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
  vpcRouterRouteDelete(params) {
    const route = lookupVpcRouterRoute(params.path)
    if (route.kind !== 'custom') {
      throw 'Only custom routes may be modified'
    }
    db.vpcRouterRoutes = db.vpcRouterRoutes.filter((r) => r.id !== route.id)
    return 204
  },
  vpcSubnetList(params) {
    const vpc = lookupVpc(params.path)
    const subnets = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
    return paginated(params.query, subnets)
  },
  vpcSubnetCreate({ body, ...params }) {
    const vpc = lookupVpc(params.path)
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
  vpcSubnetView: (params) => lookupVpcSubnet(params.path),
  vpcSubnetUpdate({ body, ...params }) {
    const subnet = lookupVpcSubnet(params.path)

    if (body.name) {
      subnet.name = body.name
    }
    if (typeof body.description === 'string') {
      subnet.description = body.description
    }

    return subnet
  },
  vpcSubnetDelete(params) {
    const subnet = lookupVpcSubnet(params.path)
    db.vpcSubnets = db.vpcSubnets.filter((s) => s.id !== subnet.id)

    return 204
  },
  vpcSubnetListNetworkInterfaces(params) {
    const subnet = lookupVpcSubnet(params.path)
    const nics = db.networkInterfaces.filter((n) => n.subnet_id === subnet.id)
    return paginated(params.query, nics)
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
  sessionMe() {
    return user1
  },
  sessionMeGroups() {
    const memberships = db.groupMemberships.filter((gm) => gm.userId === user1.id)
    const groupIds = new Set(memberships.map((gm) => gm.groupId))
    const groups = db.userGroups.filter((g) => groupIds.has(g.id))
    return { items: groups }
  },
  sessionSshkeyList(params) {
    const keys = db.sshKeys.filter((k) => k.silo_user_id === user1.id)
    return paginated(params.query, keys)
  },
  sessionSshkeyCreate({ body }) {
    errIfExists(db.sshKeys, { silo_user_id: user1.id, name: body.name })

    const newSshKey: Json<Api.SshKey> = {
      id: uuid(),
      silo_user_id: user1.id,
      ...body,
      ...getTimestamps(),
    }
    db.sshKeys.push(newSshKey)
    return json(newSshKey, { status: 201 })
  },
  sessionSshkeyView: (params) => lookupSshKey(params.path),
  sessionSshkeyDelete(params) {
    const sshKey = lookupSshKey(params.path)
    db.sshKeys = db.sshKeys.filter((i) => i.id !== sshKey.id)
    return 204
  },
  systemImageList: (params) => paginated(params.query, db.globalImages),
  systemImageCreate({ body }) {
    errIfExists(db.globalImages, { name: body.name })

    const newImage: Json<Api.GlobalImage> = {
      id: uuid(),
      // TODO: This should be calculated based off of the source
      size: 100,
      ...body,
      ...getTimestamps(),
      distribution: body.distribution.name,
      version: body.distribution.version,
    }
    db.globalImages.push(newImage)
    return json(newImage, { status: 201 })
  },
  systemImageView: (params) => lookupGlobalImage(params.path),
  systemImageDelete(params) {
    const image = lookupGlobalImage(params.path)
    db.globalImages = db.globalImages.filter((i) => i.id !== image.id)
    return 204
  },
  siloList: (params) => paginated(params.query, db.silos),
  siloCreate({ body }) {
    errIfExists(db.silos, { name: body.name })
    const newSilo: Json<Api.Silo> = {
      id: uuid(),
      ...getTimestamps(),
      ...body,
    }
    db.silos.push(newSilo)
    return json(newSilo, { status: 201 })
  },
  siloView: (params) => lookupSilo(params.path),
  siloDelete(params) {
    const silo = lookupSilo(params.path)
    db.silos = db.silos.filter((i) => i.id !== silo.id)
    return 204
  },
  siloIdentityProviderList(params) {
    const silo = lookupSilo(params.path)
    const idps = db.identityProviders.filter(({ siloId }) => siloId === silo.id).map(toIdp)
    return { items: idps }
  },

  samlIdentityProviderCreate(params) {
    const silo = lookupSilo(params.path)

    // this is a bit silly, but errIfExists doesn't handle nested keys like
    // provider.name, so to do the check we make a flatter object
    errIfExists(
      db.identityProviders.map(({ siloId, provider }) => ({ siloId, name: provider.name })),
      { siloId: silo.id, name: params.body.name }
    )

    const provider = {
      id: uuid(),
      ...pick(
        params.body,
        'name',
        'acs_url',
        'description',
        'idp_entity_id',
        'slo_url',
        'sp_client_id',
        'technical_contact_email'
      ),
      ...getTimestamps(),
    }
    db.identityProviders.push({
      type: 'saml',
      siloId: silo.id,
      provider,
    })
    return provider
  },
  samlIdentityProviderView: (params) => lookupSamlIdp(params.path),

  userList: (params) => paginated(params.query, db.users),

  systemPolicyView() {
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'fleet' && r.resource_id === FLEET_ID)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },

  systemUpdateList: (params) => paginated(params.query, db.systemUpdates),
  systemUpdateView: ({ path }) => lookupSystemUpdate(path),
  systemUpdateComponentsList: (params) => {
    const systemUpdate = lookupSystemUpdate(params.path)
    const ids = new Set(
      db.systemUpdateComponentUpdates
        .filter((o) => o.system_update_id === systemUpdate.id)
        .map((o) => o.component_update_id)
    )
    return { items: db.componentUpdates.filter(({ id }) => ids.has(id)) }
  },

  systemComponentVersionList: (params) => paginated(params.query, db.updateableComponents),

  systemUpdateStart: ({ body }) => {
    const latestDeployment = db.updateDeployments[0]
    if (latestDeployment?.status.status === 'updating') {
      // TODO: do nothing, return some kind of failure
    }

    const newDeployment: Json<UpdateDeployment> = {
      id: uuid(),
      version: body.version,
      status: { status: 'updating' },
      ...getTimestamps(),
    }

    // add to the beginning of to he list to maintain sort by most recent
    db.updateDeployments = [newDeployment, ...db.updateDeployments]

    return newDeployment
  },
  systemUpdateStop: () => 204,
  systemUpdateRefresh: NotImplemented,

  systemVersion() {
    const sortedComponents = sortBySemverDesc(db.updateableComponents)
    const low = sortedComponents[sortedComponents.length - 1].system_version
    const high = sortedComponents[0].system_version

    // assume they're sorted by most recent first
    const latestDeployment = db.updateDeployments[0]
    return {
      version_range: { low, high },
      status: latestDeployment.status,
    }
  },
  updateDeploymentsList: (params) => paginated(params.query, db.updateDeployments),
  updateDeploymentView: lookupById(db.updateDeployments),

  systemMetric: NotImplemented,

  diskViewById: lookupById(db.disks),
  imageViewById: lookupById(db.images),
  instanceNetworkInterfaceViewById: lookupById(db.networkInterfaces),
  instanceViewById: lookupById(db.instances),
  organizationViewById: lookupById(db.orgs),
  projectViewById: lookupById(db.projects),
  siloViewById: lookupById(db.silos),
  snapshotViewById: lookupById(db.snapshots),
  systemImageViewById: lookupById(db.globalImages),
  vpcRouterRouteViewById: lookupById(db.vpcRouterRoutes),
  vpcRouterViewById: lookupById(db.vpcRouters),
  vpcSubnetViewById: lookupById(db.vpcSubnets),
  vpcViewById: lookupById(db.vpcs),

  certificateCreate: NotImplemented,
  certificateDelete: NotImplemented,
  certificateList: NotImplemented,
  certificateView: NotImplemented,
  instanceMigrate: NotImplemented,
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
  ipPoolViewById: NotImplemented,
  localIdpUserCreate: NotImplemented,
  localIdpUserDelete: NotImplemented,
  loginSaml: NotImplemented,
  loginSamlBegin: NotImplemented,
  loginSpoof: NotImplemented,
  logout: NotImplemented,
  rackList: NotImplemented,
  rackView: NotImplemented,
  roleList: NotImplemented,
  roleView: NotImplemented,
  sagaList: NotImplemented,
  sagaView: NotImplemented,

  siloPolicyUpdate: NotImplemented,
  siloPolicyView: NotImplemented,
  siloUsersList: NotImplemented,
  siloUserView: NotImplemented,
  sledList: NotImplemented,
  sledView: NotImplemented,
  systemPolicyUpdate: NotImplemented,
  systemUserList: NotImplemented,
  systemUserView: NotImplemented,
  timeseriesSchemaGet: NotImplemented,
  loginLocal: NotImplemented,
  localIdpUserSetPassword: NotImplemented,
  instanceSerialConsoleStream: NotImplemented,

  diskCreateV1: NotImplemented,
  diskDeleteV1: NotImplemented,
  diskListV1: NotImplemented,
  diskViewV1: NotImplemented,
  instanceCreateV1: NotImplemented,
  instanceDeleteV1: NotImplemented,
  instanceDiskAttachV1: NotImplemented,
  instanceDiskDetachV1: NotImplemented,
  instanceDiskListV1: NotImplemented,
  instanceListV1: NotImplemented,
  instanceMigrateV1: NotImplemented,
  instanceRebootV1: NotImplemented,
  instanceSerialConsoleStreamV1: NotImplemented,
  instanceSerialConsoleV1: NotImplemented,
  instanceStartV1: NotImplemented,
  instanceStopV1: NotImplemented,
  instanceViewV1: NotImplemented,
  organizationCreateV1: NotImplemented,
  organizationDeleteV1: NotImplemented,
  organizationListV1: NotImplemented,
  organizationPolicyUpdateV1: NotImplemented,
  organizationPolicyViewV1: NotImplemented,
  organizationUpdateV1: NotImplemented,
  organizationViewV1: NotImplemented,
  projectCreateV1: NotImplemented,
  projectDeleteV1: NotImplemented,
  projectListV1: NotImplemented,
  projectPolicyUpdateV1: NotImplemented,
  projectPolicyViewV1: NotImplemented,
  projectUpdateV1: NotImplemented,
  projectViewV1: NotImplemented,
})
