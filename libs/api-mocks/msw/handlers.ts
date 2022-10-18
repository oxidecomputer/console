import type { ApiTypes as Api } from '@oxide/api'
import type { Json } from '@oxide/gen/msw-handlers'
import { json, makeHandlers } from '@oxide/gen/msw-handlers'
import { pick, sortBy } from '@oxide/util'

import { genCumulativeI64Data } from '../metrics'
import { FLEET_ID } from '../role-assignment'
import { serial } from '../serial'
import { currentUser } from '../session'
import { defaultSilo } from '../silo'
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
  lookupSilo,
  lookupSnapshot,
  lookupSshKey,
  lookupVpc,
  lookupVpcRouter,
  lookupVpcRouterRoute,
  lookupVpcSubnet,
} from './db'
import {
  NotImplemented,
  errIfExists,
  genId,
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
  groupList: (params) => paginated(params, db.userGroups),

  organizationList: (params) => paginated(params, db.orgs),
  organizationCreate(body) {
    errIfExists(db.orgs, { name: body.name })

    const newOrg: Json<Api.Organization> = {
      id: genId('org'),
      ...body,
      ...getTimestamps(),
    }
    db.orgs.push(newOrg)

    return json(newOrg, { status: 201 })
  },
  organizationView(params) {
    if (params.orgName.endsWith('-error-503')) {
      throw unavailableErr
    }

    return lookupOrg(params)
  },
  organizationUpdate(params, body) {
    const org = lookupOrg(params)

    if (typeof body.name === 'string') {
      org.name = body.name
    }
    org.description = body.description || ''

    return org
  },
  organizationDelete(params) {
    const org = lookupOrg(params)
    db.orgs = db.orgs.filter((o) => o.id !== org.id)
    return 204
  },
  organizationPolicyView(params) {
    const org = lookupOrg(params)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'organization' && r.resource_id === org.id)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  organizationPolicyUpdate(params, body) {
    const org = lookupOrg(params)

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
    const org = lookupOrg(params)
    const projects = db.projects.filter((p) => p.organization_id === org.id)

    return paginated(params, projects)
  },
  projectCreate(params, body) {
    const org = lookupOrg(params)
    errIfExists(db.projects, { name: body.name, organization_id: org.id })

    const newProject: Json<Api.Project> = {
      id: genId('project'),
      organization_id: org.id,
      ...body,
      ...getTimestamps(),
    }
    db.projects.push(newProject)

    return json(newProject, { status: 201 })
  },
  projectView: lookupProject,
  projectUpdate(params, body) {
    const project = lookupProject(params)
    if (body.name) {
      project.name = body.name
    }
    project.description = body.description || ''

    return project
  },
  projectDelete(params) {
    const project = lookupProject(params)

    db.projects = db.projects.filter((p) => p.id !== project.id)

    return 204
  },
  diskList(params) {
    const project = lookupProject(params)
    const disks = db.disks.filter((d) => d.project_id === project.id)

    return paginated(params, disks)
  },
  diskCreate(params, body) {
    const project = lookupProject(params)

    errIfExists(db.disks, { name: body.name, project_id: project.id })

    const { name, description, size, disk_source } = body
    const newDisk: Json<Api.Disk> = {
      id: genId('disk'),
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
  diskView: lookupDisk,
  diskDelete(params) {
    const disk = lookupDisk(params)

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
    lookupDisk(params)

    const { startTime, endTime } = getStartAndEndTime(params)

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
    const project = lookupProject(params)
    const images = db.images.filter((i) => i.project_id === project.id)
    return paginated(params, images)
  },
  imageCreate(params, body) {
    const project = lookupProject(params)
    errIfExists(db.images, { name: body.name, project_id: project.id })

    const newImage: Json<Api.Image> = {
      id: genId('image'),
      project_id: project.id,
      // TODO: This should be calculated based off of the source
      size: 100,
      ...body,
      ...getTimestamps(),
    }
    db.images.push(newImage)
    return json(newImage, { status: 201 })
  },
  imageView: lookupImage,
  imageDelete(params) {
    const image = lookupImage(params)
    db.images = db.images.filter((i) => i.id !== image.id)

    return 204
  },
  instanceList(params) {
    const project = lookupProject(params)
    const instances = db.instances.filter((i) => i.project_id === project.id)
    return paginated(params, instances)
  },
  instanceCreate(params, body) {
    const project = lookupProject(params)

    errIfExists(db.instances, { name: body.name, project_id: project.id })

    const newInstance: Json<Api.Instance> = {
      id: genId('instance'),
      project_id: project.id,
      ...pick(body, 'name', 'description', 'hostname', 'memory', 'ncpus'),
      ...getTimestamps(),
      run_state: 'running',
      time_run_state_updated: new Date().toISOString(),
    }
    db.instances.push(newInstance)
    return json(newInstance, { status: 201 })
  },
  instanceView: lookupInstance,
  instanceDelete(params) {
    const instance = lookupInstance(params)
    db.instances = db.instances.filter((i) => i.id !== instance.id)
    return 204
  },
  instanceDiskList(params) {
    const instance = lookupInstance(params)
    // TODO: Should disk instance state be `instance_id` instead of `instance`?
    const disks = db.disks.filter(
      (d) => 'instance' in d.state && d.state.instance === instance.id
    )
    return paginated(params, disks)
  },
  instanceDiskAttach(params, body) {
    const instance = lookupInstance(params)
    if (instance.run_state !== 'stopped') {
      throw 'Cannot attach disk to instance that is not stopped'
    }
    const disk = lookupDisk({ ...params, diskName: body.name })
    disk.state = {
      state: 'attached',
      instance: instance.id,
    }
    return disk
  },
  instanceDiskDetach(params, body) {
    const instance = lookupInstance(params)
    if (instance.run_state !== 'stopped') {
      throw 'Cannot detach disk to instance that is not stopped'
    }
    const disk = lookupDisk({ ...params, diskName: body.name })
    disk.state = {
      state: 'detached',
    }
    return disk
  },
  instanceExternalIpList(params) {
    lookupInstance(params)

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
    const instance = lookupInstance(params)
    const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
    return paginated(params, nics)
  },
  instanceNetworkInterfaceCreate(params, body) {
    const instance = lookupInstance(params)
    const nicsForInstance = db.networkInterfaces.filter(
      (n) => n.instance_id === instance.id
    )
    errIfExists(nicsForInstance, { name: body.name })

    const { name, description, subnet_name, vpc_name, ip } = body

    const vpc = lookupVpc({ ...params, vpcName: vpc_name })

    const subnet = lookupVpcSubnet({
      ...params,
      vpcName: vpc_name,
      subnetName: subnet_name,
    })

    const newNic: Json<Api.NetworkInterface> = {
      id: genId('nic'),
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
  instanceNetworkInterfaceView: lookupNetworkInterface,
  instanceNetworkInterfaceUpdate(params, body) {
    const nic = lookupNetworkInterface(params)

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
    const nic = lookupNetworkInterface(params)
    db.networkInterfaces = db.networkInterfaces.filter((n) => n.id !== nic.id)
    return 204
  },
  instanceReboot(params) {
    const instance = lookupInstance(params)
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
    const instance = lookupInstance(params)
    instance.run_state = 'running'

    return json(instance, { status: 202 })
  },
  instanceStop(params) {
    const instance = lookupInstance(params)
    instance.run_state = 'stopped'

    return json(instance, { status: 202 })
  },
  projectPolicyView(params) {
    const project = lookupProject(params)

    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  projectPolicyUpdate(params, body) {
    const project = lookupProject(params)

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
    const project = lookupProject(params)
    const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
    return paginated(params, snapshots)
  },
  snapshotCreate(params, body) {
    const project = lookupProject(params)

    errIfExists(db.snapshots, { name: body.name })

    const disk = lookupDisk({ ...params, diskName: body.disk })

    const newSnapshot: Json<Api.Snapshot> = {
      id: genId('snapshot'),
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
  snapshotView: lookupSnapshot,
  snapshotDelete(params) {
    const snapshot = lookupSnapshot(params)
    db.snapshots = db.snapshots.filter((s) => s.id !== snapshot.id)
    return 204
  },
  vpcList(params) {
    const project = lookupProject(params)
    const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
    return paginated(params, vpcs)
  },
  vpcCreate(params, body) {
    const project = lookupProject(params)
    errIfExists(db.vpcs, { name: body.name })

    const newVpc: Json<Api.Vpc> = {
      id: genId('vpc'),
      project_id: project.id,
      system_router_id: genId('system-router'),
      ...body,
      // API is supposed to generate one if none provided. close enough
      ipv6_prefix: body.ipv6_prefix || 'fd2d:4569:88b2::/64',
      ...getTimestamps(),
    }
    db.vpcs.push(newVpc)

    // Also create a default subnet
    const newSubnet: Json<Api.VpcSubnet> = {
      id: genId('vpc-subnet'),
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
  vpcView: lookupVpc,
  vpcUpdate(params, body) {
    const vpc = lookupVpc(params)

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
    const vpc = lookupVpc(params)

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
    const vpc = lookupVpc(params)
    const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)

    return { rules: sortBy(rules, (r) => r.name) }
  },
  vpcFirewallRulesUpdate(params, body) {
    const vpc = lookupVpc(params)

    const rules = body.rules.map((rule) => ({
      vpc_id: vpc.id,
      id: genId('firewall-rule'),
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
    const vpc = lookupVpc(params)
    const routers = db.vpcRouters.filter((r) => r.vpc_id === vpc.id)
    return paginated(params, routers)
  },
  vpcRouterCreate(params, body) {
    const vpc = lookupVpc(params)
    errIfExists(db.vpcRouters, { vpc_id: vpc.id, name: body.name })

    const newRouter: Json<Api.VpcRouter> = {
      id: genId('vpc-router'),
      vpc_id: vpc.id,
      kind: 'custom',
      ...body,
      ...getTimestamps(),
    }
    db.vpcRouters.push(newRouter)
    return json(newRouter, { status: 201 })
  },
  vpcRouterView: lookupVpcRouter,
  vpcRouterUpdate(params, body) {
    const router = lookupVpcRouter(params)

    if (body.name) {
      router.name = body.name
    }
    if (typeof body.description === 'string') {
      router.description = body.description
    }

    return router
  },
  vpcRouterDelete(params) {
    const router = lookupVpcRouter(params)

    // TODO: Are there routers that can't be deleted?
    db.vpcRouters = db.vpcRouters.filter((r) => r.id !== router.id)

    return 204
  },
  vpcRouterRouteList(params) {
    const router = lookupVpcRouter(params)
    const routers = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
    return paginated(params, routers)
  },
  vpcRouterRouteCreate(params, body) {
    const router = lookupVpcRouter(params)

    errIfExists(db.vpcRouterRoutes, { vpc_router_id: router.id, name: body.name })

    const newRoute: Json<Api.RouterRoute> = {
      id: genId('router-route'),
      vpc_router_id: router.id,
      kind: 'custom',
      ...body,
      ...getTimestamps(),
    }
    return json(newRoute, { status: 201 })
  },
  vpcRouterRouteView: lookupVpcRouterRoute,
  vpcRouterRouteUpdate(params, body) {
    const route = lookupVpcRouterRoute(params)
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
    const route = lookupVpcRouterRoute(params)
    if (route.kind !== 'custom') {
      throw 'Only custom routes may be modified'
    }
    db.vpcRouterRoutes = db.vpcRouterRoutes.filter((r) => r.id !== route.id)
    return 204
  },
  vpcSubnetList(params) {
    const vpc = lookupVpc(params)
    const subnets = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
    return paginated(params, subnets)
  },
  vpcSubnetCreate(params, body) {
    const vpc = lookupVpc(params)
    errIfExists(db.vpcSubnets, { vpc_id: vpc.id, name: body.name })

    // TODO: Create a route for the subnet in the default router
    const newSubnet: Json<Api.VpcSubnet> = {
      id: genId('vpc-subnet'),
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
  vpcSubnetView: lookupVpcSubnet,
  vpcSubnetUpdate(params, body) {
    const subnet = lookupVpcSubnet(params)

    if (body.name) {
      subnet.name = body.name
    }
    if (typeof body.description === 'string') {
      subnet.description = body.description
    }

    return subnet
  },
  vpcSubnetDelete(params) {
    const subnet = lookupVpcSubnet(params)
    db.vpcSubnets = db.vpcSubnets.filter((s) => s.id !== subnet.id)

    return 204
  },
  vpcSubnetListNetworkInterfaces(params) {
    const subnet = lookupVpcSubnet(params)
    const nics = db.networkInterfaces.filter((n) => n.subnet_id === subnet.id)
    return paginated(params, nics)
  },
  policyView() {
    // assume we're in the default silo
    const siloId = defaultSilo.id
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'silo' && r.resource_id === siloId)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },
  policyUpdate(body) {
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
    return currentUser
  },
  sessionSshkeyList(params) {
    const keys = db.sshKeys.filter((k) => k.silo_user_id === currentUser.id)
    return paginated(params, keys)
  },
  sessionSshkeyCreate(body) {
    errIfExists(db.sshKeys, { silo_user_id: currentUser.id, name: body.name })

    const newSshKey: Json<Api.SshKey> = {
      id: genId('ssh-key'),
      silo_user_id: currentUser.id,
      ...body,
      ...getTimestamps(),
    }
    db.sshKeys.push(newSshKey)
    return json(newSshKey, { status: 201 })
  },
  sessionSshkeyView: lookupSshKey,
  sessionSshkeyDelete(params) {
    const sshKey = lookupSshKey(params)
    db.sshKeys = db.sshKeys.filter((i) => i.id !== sshKey.id)
    return 204
  },
  systemImageList: (params) => paginated(params, db.globalImages),
  systemImageCreate(body) {
    errIfExists(db.globalImages, { name: body.name })

    const newImage: Json<Api.GlobalImage> = {
      id: genId('global-image'),
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
  systemImageView: lookupGlobalImage,
  systemImageDelete(params) {
    const image = lookupGlobalImage(params)
    db.globalImages = db.globalImages.filter((i) => i.id !== image.id)
    return 204
  },
  siloList: (params) => paginated(params, db.silos),
  siloCreate(body) {
    errIfExists(db.silos, { name: body.name })
    const newSilo: Json<Api.Silo> = {
      id: genId('silo'),
      ...getTimestamps(),
      ...body,
    }
    db.silos.push(newSilo)
    return json(newSilo, { status: 201 })
  },
  siloView: lookupSilo,
  siloDelete(params) {
    const silo = lookupSilo(params)
    db.silos = db.silos.filter((i) => i.id !== silo.id)
    return 204
  },
  userList: (params) => paginated(params, db.users),

  systemPolicyView() {
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'fleet' && r.resource_id === FLEET_ID)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return { role_assignments }
  },

  diskViewById: lookupById(db.disks),
  imageViewById: lookupById(db.images),
  instanceViewById: lookupById(db.instances),
  instanceNetworkInterfaceViewById: lookupById(db.networkInterfaces),
  organizationViewById: lookupById(db.orgs),
  projectViewById: lookupById(db.projects),
  snapshotViewById: lookupById(db.snapshots),
  vpcRouterRouteViewById: lookupById(db.vpcRouterRoutes),
  vpcRouterViewById: lookupById(db.vpcRouters),
  vpcSubnetViewById: lookupById(db.vpcSubnets),
  vpcViewById: lookupById(db.vpcs),
  systemImageViewById: lookupById(db.globalImages),
  siloViewById: lookupById(db.silos),

  instanceMigrate: NotImplemented,
  loginSpoof: NotImplemented,
  loginSamlBegin: NotImplemented,
  loginSaml: NotImplemented,
  logout: NotImplemented,
  roleList: NotImplemented,
  roleView: NotImplemented,
  ipPoolViewById: NotImplemented,
  rackList: NotImplemented,
  rackView: NotImplemented,
  sledList: NotImplemented,
  sledView: NotImplemented,
  ipPoolList: NotImplemented,
  ipPoolCreate: NotImplemented,
  ipPoolView: NotImplemented,
  ipPoolUpdate: NotImplemented,
  ipPoolDelete: NotImplemented,
  ipPoolRangeList: NotImplemented,
  ipPoolRangeAdd: NotImplemented,
  ipPoolRangeRemove: NotImplemented,
  ipPoolServiceView: NotImplemented,
  ipPoolServiceRangeList: NotImplemented,
  ipPoolServiceRangeAdd: NotImplemented,
  ipPoolServiceRangeRemove: NotImplemented,
  systemPolicyUpdate: NotImplemented,
  sagaList: NotImplemented,
  sagaView: NotImplemented,
  siloIdentityProviderList: NotImplemented,
  samlIdentityProviderCreate: NotImplemented,
  samlIdentityProviderView: NotImplemented,
  siloPolicyView: NotImplemented,
  siloPolicyUpdate: NotImplemented,
  updatesRefresh: NotImplemented,
  systemUserList: NotImplemented,
  systemUserView: NotImplemented,
  timeseriesSchemaGet: NotImplemented,
})
