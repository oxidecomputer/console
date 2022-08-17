import { compose, context, rest } from 'msw'

import type { ApiTypes as Api } from '@oxide/api'
import { pick, sortBy } from '@oxide/util'

import type { Json } from '../json-type'
import { serial } from '../serial'
import { sessionMe } from '../session'
import { defaultSilo } from '../silo'
import type {
  DiskParams,
  GlobalImageParams,
  IdParams,
  InstanceParams,
  NetworkInterfaceParams,
  NotFound,
  OrgParams,
  ProjectParams,
  SshKeyParams,
  VpcParams,
  VpcRouterParams,
  VpcSubnetParams,
} from './db'
import {
  db,
  lookupById,
  lookupDisk,
  lookupGlobalImage,
  lookupInstance,
  lookupNetworkInterface,
  lookupOrg,
  lookupProject,
  lookupSshKey,
  lookupVpc,
  lookupVpcRouter,
  lookupVpcSubnet,
} from './db'
import { json, paginated } from './util'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

/// generate random 11 digit hex string, prefix optional
const genId = (prefix?: string) =>
  (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 10e12).toString(16)

// Helper function to remove some of the boilerplate from /by-id/ requests
const getById = <T extends { id: string }>(path: string, table: T[]) =>
  rest.get<never, IdParams, T | GetErr>(path, lookupById(table))

function getTimestamps() {
  const now = new Date().toISOString()
  return { time_created: now, time_modified: now }
}

const alreadyExistsBody = { error_code: 'ObjectAlreadyExists' } as const
type AlreadyExists = typeof alreadyExistsBody
const alreadyExistsErr = json(alreadyExistsBody, { status: 400 })

const unavailableBody = { error_code: 'ServiceUnavailable' } as const
type Unavailable = typeof unavailableBody
const unavailableErr = json(unavailableBody, { status: 503 })

const badRequest = (msg: string) =>
  compose(
    context.status(400),
    context.json({
      request_id: '',
      error_code: null,
      message: `unable to parse body: ${msg} at line 1 column 1`,
    })
  )

type GetErr = NotFound | Unavailable
type PostErr = AlreadyExists | NotFound

export const handlers = [
  rest.get('/api/session/me', (req, res) => res(json(sessionMe))),

  rest.get<never, never, Json<Api.SshKeyResultsPage>>(
    '/api/session/me/sshkeys',
    (req, res) =>
      res(
        json(
          paginated(
            req.url.search,
            db.sshKeys.filter((key) => key.silo_user_id === sessionMe.id)
          )
        )
      )
  ),

  rest.post<Json<Api.SshKeyCreate>, never, Json<Api.SshKey> | PostErr>(
    '/api/session/me/sshkeys',
    (req, res) => {
      const alreadyExists = db.sshKeys.some(
        (key) => key.name === req.body.name && key.silo_user_id === sessionMe.id
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      // TODO: validate public_key
      if (!req.body.public_key) {
        return res(badRequest('expected public key'))
      }

      const newSshKey: Json<Api.SshKey> = {
        id: genId('ssh-key'),
        silo_user_id: sessionMe.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.sshKeys.push(newSshKey)
      return res(json(newSshKey, { status: 201 }))
    }
  ),

  rest.delete<never, SshKeyParams, GetErr>(
    '/api/session/me/sshkeys/:sshKeyName',
    (req, res, ctx) => {
      const [sshKey, err] = lookupSshKey(req.params)
      if (err) return res(err)
      db.sshKeys = db.sshKeys.filter((i) => i.id !== sshKey.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, never, Json<Api.SiloRolePolicy> | GetErr>('/api/policy', (req, res) => {
    // assume we're in the default silo
    const siloId = defaultSilo.id
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'silo' && r.resource_id === siloId)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return res(json({ role_assignments }))
  }),

  rest.get<never, never, Json<Api.OrganizationResultsPage>>(
    '/api/organizations',
    (req, res) => res(json(paginated(req.url.search, db.orgs)))
  ),

  rest.post<Json<Api.OrganizationCreate>, never, Json<Api.Organization> | PostErr>(
    '/api/organizations',
    (req, res) => {
      const alreadyExists = db.orgs.some((o) => o.name === req.body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newOrg: Json<Api.Organization> = {
        id: genId('org'),
        ...req.body,
        ...getTimestamps(),
      }
      db.orgs.push(newOrg)
      return res(json(newOrg, { status: 201 }))
    }
  ),

  rest.get<never, OrgParams, Json<Api.Organization> | GetErr>(
    '/api/organizations/:orgName',
    (req, res) => {
      if (req.params.orgName === '503') {
        return res(unavailableErr)
      }

      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      return res(json(org))
    }
  ),

  rest.put<Json<Api.OrganizationUpdate>, OrgParams, Json<Api.Organization> | PostErr>(
    '/api/organizations/:orgName',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }
      org.name = req.body.name
      org.description = req.body.description || ''

      return res(json(org))
    }
  ),

  rest.get<never, OrgParams, Json<Api.OrganizationRolePolicy> | GetErr>(
    '/api/organizations/:orgName/policy',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)
      const role_assignments = db.roleAssignments
        .filter((r) => r.resource_type === 'organization' && r.resource_id === org.id)
        .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

      return res(json({ role_assignments }))
    }
  ),

  rest.put<
    Json<Api.OrganizationRolePolicy>,
    ProjectParams,
    Json<Api.OrganizationRolePolicy> | PostErr
  >('/api/organizations/:orgName/policy', (req, res) => {
    const [org, err] = lookupOrg(req.params)
    if (err) return res(err)

    // TODO: validate input lol
    const newAssignments = req.body.role_assignments.map((r) => ({
      resource_type: 'organization' as const,
      resource_id: org.id,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'organization' && r.resource_id === org.id)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return res(json(req.body))
  }),

  rest.get<never, OrgParams, Json<Api.ProjectResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const projects = db.projects.filter((p) => p.organization_id === org.id)
      return res(json(paginated(req.url.search, projects)))
    }
  ),

  rest.post<Json<Api.ProjectCreate>, OrgParams, Json<Api.Project> | PostErr>(
    '/api/organizations/:orgName/projects',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const alreadyExists = db.projects.some(
        (p) => p.organization_id === org.id && p.name === req.body.name
      )

      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newProject: Json<Api.Project> = {
        id: genId('project'),
        organization_id: org.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.projects.push(newProject)
      return res(json(newProject, { status: 201 }))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.Project> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      return res(json(project))
    }
  ),

  rest.put<Json<Api.ProjectUpdate>, ProjectParams, Json<Api.Project> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }
      project.name = req.body.name
      project.description = req.body.description || ''

      return res(json(project))
    }
  ),

  rest.delete<never, ProjectParams, GetErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      db.projects = db.projects.filter((p) => p.id !== project.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.ProjectRolePolicy> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/policy',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const role_assignments = db.roleAssignments
        .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
        .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

      return res(json({ role_assignments }))
    }
  ),

  rest.put<
    Json<Api.ProjectRolePolicy>,
    ProjectParams,
    Json<Api.ProjectRolePolicy> | PostErr
  >('/api/organizations/:orgName/projects/:projectName/policy', (req, res) => {
    const [project, err] = lookupProject(req.params)
    if (err) return res(err)

    // TODO: validate input lol
    const newAssignments = req.body.role_assignments.map((r) => ({
      resource_type: 'project' as const,
      resource_id: project.id,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'project' && r.resource_id === project.id)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return res(json(req.body))
  }),

  rest.get<never, ProjectParams, Json<Api.InstanceResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const instances = db.instances.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, instances)))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.Instance> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      return res(json(instance))
    }
  ),

  rest.delete<never, InstanceParams, GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName',
    (req, res, ctx) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      db.instances = db.instances.filter((i) => i.id !== instance.id)
      return res(ctx.status(204))
    }
  ),

  rest.post<Json<Api.InstanceCreate>, ProjectParams, Json<Api.Instance> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const alreadyExists = db.instances.some(
        (i) => i.project_id === project.id && i.name === req.body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newInstance: Json<Api.Instance> = {
        id: genId('instance'),
        project_id: project.id,
        ...pick(req.body, 'name', 'description', 'hostname', 'memory', 'ncpus'),
        ...getTimestamps(),
        run_state: 'running',
        time_run_state_updated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(json(newInstance, { status: 201, delay: 2000 }))
    }
  ),

  rest.post<never, InstanceParams, Json<Api.Instance> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/start',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'running'
      return res(json(instance, { status: 202 }))
    }
  ),

  rest.post<never, InstanceParams, Json<Api.Instance> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/stop',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'stopped'
      return res(json(instance, { status: 202 }))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.DiskResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/disks',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const disks = db.disks.filter(
        (d) => 'instance' in d.state && d.state.instance === instance.id
      )
      return res(json(paginated(req.url.search, disks)))
    }
  ),

  rest.post<Json<Api.DiskIdentifier>, InstanceParams, Json<Api.Disk> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach',
    (req, res) => {
      const [instance, instanceErr] = lookupInstance(req.params)
      if (instanceErr) return res(instanceErr)
      if (instance.run_state !== 'stopped') {
        return res(badRequest('instance must be stopped'))
      }
      const [disk, diskErr] = lookupDisk({ ...req.params, diskName: req.body.name })
      if (diskErr) return res(diskErr)
      disk.state = {
        state: 'attached',
        instance: instance.id,
      }
      return res(json(disk))
    }
  ),

  rest.post<Json<Api.DiskIdentifier>, InstanceParams, Json<Api.Disk> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach',
    (req, res) => {
      const [instance, instanceErr] = lookupInstance(req.params)
      if (instanceErr) return res(instanceErr)
      if (instance.run_state !== 'stopped') {
        return res(badRequest('instance must be stopped'))
      }
      const [disk, diskErr] = lookupDisk({ ...req.params, diskName: req.body.name })
      if (diskErr) return res(diskErr)
      disk.state = {
        state: 'detached',
      }
      return res(json(disk))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.ExternalIpResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips',
    (req, res) => {
      const [, err] = lookupInstance(req.params)
      if (err) return res(err)
      // TODO: proper mock table
      const items = [
        {
          ip: '123.4.56.7',
          kind: 'ephemeral',
        } as const,
      ]
      return res(json({ items }))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.NetworkInterfaceResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
      return res(json(paginated(req.url.search, nics)))
    }
  ),

  rest.post<
    Json<Api.NetworkInterfaceCreate>,
    InstanceParams,
    Json<Api.NetworkInterface> | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const nicsForInstance = db.networkInterfaces.filter(
        (n) => n.instance_id === instance.id
      )

      const alreadyExists = nicsForInstance.some((n) => n.name === req.body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const { name, description, subnet_name, vpc_name, ip } = req.body

      const [vpc, vpcErr] = lookupVpc({ ...req.params, vpcName: vpc_name })
      if (vpcErr) return res(vpcErr)

      const [subnet, subnetErr] = lookupVpcSubnet({
        ...req.params,
        vpcName: vpc_name,
        subnetName: subnet_name,
      })
      if (subnetErr) return res(subnetErr)

      // TODO: validate IP

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

      return res(json(newNic))
    }
  ),

  rest.get<never, NetworkInterfaceParams, Json<Api.NetworkInterface> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    (req, res) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)
      return res(json(nic))
    }
  ),

  rest.put<
    Json<Api.NetworkInterfaceUpdate>,
    NetworkInterfaceParams,
    Json<Api.NetworkInterface> | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    (req, res, ctx) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)

      if (req.body.name) {
        nic.name = req.body.name
      }
      if (typeof req.body.description === 'string') {
        nic.description = req.body.description
      }
      if (typeof req.body.primary === 'boolean' && req.body.primary !== nic.primary) {
        if (nic.primary) {
          return res(badRequest('Cannot remove the primary interface'))
        }
        db.networkInterfaces
          .filter((n) => n.instance_id === nic.instance_id)
          .forEach((n) => {
            n.primary = false
          })
        nic.primary = !!req.body.primary
      }
      return res(ctx.status(204))
    }
  ),

  rest.delete<never, NetworkInterfaceParams, GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    (req, res, ctx) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)
      db.networkInterfaces = db.networkInterfaces.filter((n) => n.id !== nic.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.InstanceSerialConsoleData> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console',
    (req, res) => {
      // TODO: Add support for query params
      return res(json(serial))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.DiskResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const disks = db.disks.filter((d) => d.project_id === project.id)
      return res(json(paginated(req.url.search, disks)))
    }
  ),

  rest.post<Json<Api.DiskCreate>, ProjectParams, Json<Api.Disk> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const alreadyExists = db.disks.some(
        (s) => s.project_id === project.id && s.name === req.body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const { name, description, size, disk_source } = req.body
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
      return res(json(newDisk, { status: 201 }))
    }
  ),

  rest.delete<never, DiskParams, GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks/:diskName',
    (req, res, ctx) => {
      const [disk, err] = lookupDisk(req.params)
      if (err) return res(err)
      // Governed by https://github.com/oxidecomputer/omicron/blob/e5704d7f343fa0633751527dedf276409647ad4e/nexus/src/db/datastore.rs#L2103
      switch (disk.state.state) {
        case 'creating':
        case 'detached':
        case 'faulted':
          break
        default:
          return res(badRequest('Cannot delete disk in state ' + disk.state.state))
      }
      db.disks = db.disks.filter((d) => d.id !== disk.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.ImageResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/images',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const images = db.images.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, images)))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.SnapshotResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/snapshots',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, snapshots)))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.VpcResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
      return res(json(paginated(req.url.search, vpcs)))
    }
  ),

  rest.get<never, VpcParams, Json<Api.Vpc> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      return res(json(vpc))
    }
  ),

  rest.post<Json<Api.VpcCreate>, ProjectParams, Json<Api.Vpc> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const alreadyExists = db.vpcs.some(
        (s) => s.project_id === project.id && s.name === req.body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newVpc: Json<Api.Vpc> = {
        id: genId('vpc'),
        project_id: project.id,
        system_router_id: genId('system-router'),
        ...req.body,
        // API is supposed to generate one if none provided. close enough
        ipv6_prefix: req.body.ipv6_prefix || 'fd2d:4569:88b2::/64',
        ...getTimestamps(),
      }
      db.vpcs.push(newVpc)
      return res(json(newVpc, { status: 201 }))
    }
  ),

  rest.put<Json<Api.Vpc>, VpcParams, Json<Api.Vpc> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      if (req.body.name) {
        vpc.name = req.body.name
      }

      if (typeof req.body.description === 'string') {
        vpc.description = req.body.description
      }

      if (req.body.dns_name) {
        vpc.dns_name = req.body.dns_name
      }
      return res(json(vpc))
    }
  ),

  rest.get<never, VpcParams, Json<Api.VpcSubnetResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const subnets = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
      return res(json(paginated(req.url.search, subnets)))
    }
  ),

  rest.post<Json<Api.VpcSubnetCreate>, VpcParams, Json<Api.VpcSubnet> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const alreadyExists = db.vpcSubnets.some(
        (s) => s.vpc_id === vpc.id && s.name === req.body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newSubnet: Json<Api.VpcSubnet> = {
        id: genId('vpc-subnet'),
        vpc_id: vpc.id,
        ...req.body,
        // required in subnet create but not in update, so we need a fallback.
        // API says "A random `/64` block will be assigned if one is not
        // provided." Our fallback is not random, but it should be good enough.
        ipv6_block: req.body.ipv6_block || 'fd2d:4569:88b1::/64',
        ...getTimestamps(),
      }
      db.vpcSubnets.push(newSubnet)
      return res(json(newSubnet, { status: 201 }))
    }
  ),

  rest.put<Json<Api.VpcSubnetUpdate>, VpcSubnetParams, Json<Api.VpcSubnet> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
    (req, res, ctx) => {
      const [subnet, err] = lookupVpcSubnet(req.params)
      if (err) return res(err)

      if (req.body.name) {
        subnet.name = req.body.name
      }
      if (typeof req.body.description === 'string') {
        subnet.description = req.body.description
      }
      return res(ctx.status(204))
    }
  ),

  rest.get<never, VpcParams, Json<Api.VpcFirewallRules> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)
      return res(json({ rules: sortBy(rules, (r) => r.name) }))
    }
  ),

  rest.put<
    Json<Api.VpcFirewallRuleUpdateParams>,
    VpcParams,
    Json<Api.VpcFirewallRules> | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const rules = req.body.rules.map((rule) => ({
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
      return res(json({ rules: sortBy(rules, (r) => r.name) }))
    }
  ),

  rest.get<never, VpcParams, Json<Api.VpcRouterResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const routers = db.vpcRouters.filter((s) => s.vpc_id === vpc.id)
      return res(json(paginated(req.url.search, routers)))
    }
  ),

  rest.post<Json<Api.VpcRouterCreate>, VpcParams, Json<Api.VpcRouter> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const alreadyExists = db.vpcRouters.some(
        (x) => x.vpc_id === vpc.id && x.name === req.body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!req.body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newRouter: Json<Api.VpcRouter> = {
        id: genId('vpc-router'),
        vpc_id: vpc.id,
        kind: 'custom',
        ...req.body,
        ...getTimestamps(),
      }
      db.vpcRouters.push(newRouter)
      return res(json(newRouter, { status: 201 }))
    }
  ),

  rest.put<Json<Api.VpcRouterUpdate>, VpcRouterParams, Json<Api.VpcRouter> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
    (req, res, ctx) => {
      const [router, err] = lookupVpcRouter(req.params)
      if (err) return res(err)

      if (req.body.name) {
        router.name = req.body.name
      }
      if (typeof req.body.description === 'string') {
        router.description = req.body.description
      }
      return res(ctx.status(204))
    }
  ),

  rest.get<never, VpcRouterParams, Json<Api.RouterRouteResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
    (req, res) => {
      const [router, err] = lookupVpcRouter(req.params)
      if (err) return res(err)
      const routers = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
      return res(json(paginated(req.url.search, routers)))
    }
  ),

  rest.get<never, never, Json<Api.GlobalImageResultsPage> | GetErr>(
    '/api/images',
    (req, res) => {
      return res(json(paginated(req.url.search, db.globalImages)))
    }
  ),

  rest.get<never, GlobalImageParams, Json<Api.GlobalImage> | GetErr>(
    '/api/images/:imageName',
    (req, res) => {
      const [image, err] = lookupGlobalImage(req.params)
      if (err) return res(err)
      return res(json(image))
    }
  ),

  // note that in the API this is meant for system users, but that could change.
  // kind of a hack to pretend it's about normal users.
  // see https://github.com/oxidecomputer/omicron/issues/1235
  rest.get<never, never, Json<Api.UserResultsPage> | GetErr>('/api/users', (req, res) => {
    return res(json(paginated(req.url.search, db.users)))
  }),

  rest.post<Json<Api.DeviceAuthVerify>, never, PostErr>(
    '/api/device/confirm',
    (req, res, ctx) => {
      if (req.body.user_code === 'BADD-CODE') {
        return res(ctx.status(404))
      }
      return res(ctx.status(200))
    }
  ),

  getById('/api/by-id/organizations/:id', db.orgs),
  getById('/api/by-id/projects/:id', db.projects),
  getById('/api/by-id/instances/:id', db.instances),
  getById('/api/by-id/network-interfaces/:id', db.networkInterfaces),
  getById('/api/by-id/vpcs/:id', db.vpcs),
  getById('/api/by-id/vpc-subnets/:id', db.vpcSubnets),
  getById('/api/by-id/vpc-routers/:id', db.vpcRouters),
  getById('/api/by-id/vpc-router-routes/:id', db.vpcRouterRoutes),
  getById('/api/by-id/disks/:id', db.disks),
  getById('/api/by-id/global-images/:id', db.globalImages),
  getById('/api/by-id/images/:id', db.images),
  getById('/api/by-id/snapshots/:id', db.snapshots),
]
