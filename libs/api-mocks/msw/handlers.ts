import { subHours } from 'date-fns'
import { compose, context, rest } from 'msw'

import type { ApiTypes as Api, PathParams as PP } from '@oxide/api'
import { pick, sortBy } from '@oxide/util'

import type { Json } from '../json-type'
import { genCumulativeI64Data } from '../metrics'
import { serial } from '../serial'
import { sessionMe } from '../session'
import { defaultSilo } from '../silo'
import type { NotFound } from './db'
import { lookupSnapshot } from './db'
import { lookupSilo } from './db'
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
import { getDateParam, json, paginated } from './util'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

/// generate random 11 digit hex string, prefix optional
const genId = (prefix?: string) =>
  (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 10e12).toString(16)

// Helper function to remove some of the boilerplate from /by-id/ requests
const getById = <T extends { id: string }>(path: string, table: T[]) =>
  rest.get<never, PP.Id, T | GetErr>(path, lookupById(table))

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
  rest.get('/session/me', (req, res) => res(json(sessionMe))),

  rest.get<never, never, Json<Api.SshKeyResultsPage>>('/session/me/sshkeys', (req, res) =>
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
    '/session/me/sshkeys',
    async (req, res) => {
      const body = await req.json()
      const alreadyExists = db.sshKeys.some(
        (key) => key.name === body.name && key.silo_user_id === sessionMe.id
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      // TODO: validate public_key
      if (!body.public_key) {
        return res(badRequest('expected public key'))
      }

      const newSshKey: Json<Api.SshKey> = {
        id: genId('ssh-key'),
        silo_user_id: sessionMe.id,
        ...body,
        ...getTimestamps(),
      }
      db.sshKeys.push(newSshKey)
      return res(json(newSshKey, { status: 201 }))
    }
  ),

  rest.delete<never, PP.SshKey, GetErr>(
    '/session/me/sshkeys/:sshKeyName',
    (req, res, ctx) => {
      const [sshKey, err] = lookupSshKey(req.params)
      if (err) return res(err)
      db.sshKeys = db.sshKeys.filter((i) => i.id !== sshKey.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, never, Json<Api.SiloRolePolicy> | GetErr>('/policy', (req, res) => {
    // assume we're in the default silo
    const siloId = defaultSilo.id
    const role_assignments = db.roleAssignments
      .filter((r) => r.resource_type === 'silo' && r.resource_id === siloId)
      .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

    return res(json({ role_assignments }))
  }),

  rest.get<never, never, Json<Api.OrganizationResultsPage>>('/organizations', (req, res) =>
    res(json(paginated(req.url.search, db.orgs)))
  ),

  rest.post<Json<Api.OrganizationCreate>, never, Json<Api.Organization> | PostErr>(
    '/organizations',
    async (req, res) => {
      const body = await req.json()
      const alreadyExists = db.orgs.some((o) => o.name === body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newOrg: Json<Api.Organization> = {
        id: genId('org'),
        ...body,
        ...getTimestamps(),
      }
      db.orgs.push(newOrg)
      return res(json(newOrg, { status: 201 }))
    }
  ),

  rest.get<never, PP.Org, Json<Api.Organization> | GetErr>(
    '/organizations/:orgName',
    (req, res) => {
      if (req.params.orgName === '503') {
        return res(unavailableErr)
      }

      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      return res(json(org))
    }
  ),

  rest.put<Json<Api.OrganizationUpdate>, PP.Org, Json<Api.Organization> | PostErr>(
    '/organizations/:orgName',
    async (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }
      org.name = body.name
      org.description = body.description || ''

      return res(json(org))
    }
  ),

  rest.get<never, PP.Org, Json<Api.OrganizationRolePolicy> | GetErr>(
    '/organizations/:orgName/policy',
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
    PP.Project,
    Json<Api.OrganizationRolePolicy> | PostErr
  >('/organizations/:orgName/policy', async (req, res) => {
    const [org, err] = lookupOrg(req.params)
    if (err) return res(err)

    // TODO: validate input lol
    const body = await req.json()
    const newAssignments = body.role_assignments.map((r) => ({
      resource_type: 'organization' as const,
      resource_id: org.id,
      ...pick(r, 'identity_id', 'identity_type', 'role_name'),
    }))

    const unrelatedAssignments = db.roleAssignments.filter(
      (r) => !(r.resource_type === 'organization' && r.resource_id === org.id)
    )

    db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

    return res(json(body))
  }),

  rest.delete<never, PP.Org, GetErr>('/organizations/:orgName', (req, res, ctx) => {
    const [org, err] = lookupOrg(req.params)
    if (err) return res(err)
    db.orgs = db.orgs.filter((o) => o.id !== org.id)
    return res(ctx.status(204))
  }),

  rest.get<never, PP.Org, Json<Api.ProjectResultsPage> | GetErr>(
    '/organizations/:orgName/projects',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const projects = db.projects.filter((p) => p.organization_id === org.id)
      return res(json(paginated(req.url.search, projects)))
    }
  ),

  rest.post<Json<Api.ProjectCreate>, PP.Org, Json<Api.Project> | PostErr>(
    '/organizations/:orgName/projects',
    async (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.projects.some(
        (p) => p.organization_id === org.id && p.name === body.name
      )

      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newProject: Json<Api.Project> = {
        id: genId('project'),
        organization_id: org.id,
        ...body,
        ...getTimestamps(),
      }
      db.projects.push(newProject)
      return res(json(newProject, { status: 201 }))
    }
  ),

  rest.get<never, PP.Project, Json<Api.Project> | GetErr>(
    '/organizations/:orgName/projects/:projectName',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      return res(json(project))
    }
  ),

  rest.put<Json<Api.ProjectUpdate>, PP.Project, Json<Api.Project> | PostErr>(
    '/organizations/:orgName/projects/:projectName',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }
      project.name = body.name
      project.description = body.description || ''

      return res(json(project))
    }
  ),

  rest.delete<never, PP.Project, GetErr>(
    '/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      db.projects = db.projects.filter((p) => p.id !== project.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.Project, Json<Api.ProjectRolePolicy> | GetErr>(
    '/organizations/:orgName/projects/:projectName/policy',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const role_assignments = db.roleAssignments
        .filter((r) => r.resource_type === 'project' && r.resource_id === project.id)
        .map((r) => pick(r, 'identity_id', 'identity_type', 'role_name'))

      return res(json({ role_assignments }))
    }
  ),

  rest.put<Json<Api.ProjectRolePolicy>, PP.Project, Json<Api.ProjectRolePolicy> | PostErr>(
    '/organizations/:orgName/projects/:projectName/policy',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      // TODO: validate input lol
      const body = await req.json()
      const newAssignments = body.role_assignments.map((r) => ({
        resource_type: 'project' as const,
        resource_id: project.id,
        ...pick(r, 'identity_id', 'identity_type', 'role_name'),
      }))

      const unrelatedAssignments = db.roleAssignments.filter(
        (r) => !(r.resource_type === 'project' && r.resource_id === project.id)
      )

      db.roleAssignments = [...unrelatedAssignments, ...newAssignments]

      return res(json(body))
    }
  ),

  rest.get<never, PP.Project, Json<Api.InstanceResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const instances = db.instances.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, instances)))
    }
  ),

  rest.get<never, PP.Instance, Json<Api.Instance> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      return res(json(instance))
    }
  ),

  rest.delete<never, PP.Instance, GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName',
    (req, res, ctx) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      db.instances = db.instances.filter((i) => i.id !== instance.id)
      return res(ctx.status(204))
    }
  ),

  rest.post<Json<Api.InstanceCreate>, PP.Project, Json<Api.Instance> | PostErr>(
    '/organizations/:orgName/projects/:projectName/instances',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.instances.some(
        (i) => i.project_id === project.id && i.name === body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newInstance: Json<Api.Instance> = {
        id: genId('instance'),
        project_id: project.id,
        ...pick(body, 'name', 'description', 'hostname', 'memory', 'ncpus'),
        ...getTimestamps(),
        run_state: 'running',
        time_run_state_updated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(json(newInstance, { status: 201, delay: 2000 }))
    }
  ),

  rest.post<never, PP.Instance, Json<Api.Instance> | PostErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/start',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'running'
      return res(json(instance, { status: 202 }))
    }
  ),

  rest.post<never, PP.Instance, Json<Api.Instance> | PostErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/stop',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'stopped'
      return res(json(instance, { status: 202 }))
    }
  ),

  rest.get<never, PP.Instance, Json<Api.DiskResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const disks = db.disks.filter(
        (d) => 'instance' in d.state && d.state.instance === instance.id
      )
      return res(json(paginated(req.url.search, disks)))
    }
  ),

  rest.post<Json<Api.DiskIdentifier>, PP.Instance, Json<Api.Disk> | PostErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach',
    async (req, res) => {
      const [instance, instanceErr] = lookupInstance(req.params)
      if (instanceErr) return res(instanceErr)
      if (instance.run_state !== 'stopped') {
        return res(badRequest('instance must be stopped'))
      }
      const body = await req.json()
      const [disk, diskErr] = lookupDisk({ ...req.params, diskName: body.name })
      if (diskErr) return res(diskErr)
      disk.state = {
        state: 'attached',
        instance: instance.id,
      }
      return res(json(disk))
    }
  ),

  rest.post<Json<Api.DiskIdentifier>, PP.Instance, Json<Api.Disk> | PostErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach',
    async (req, res) => {
      const [instance, instanceErr] = lookupInstance(req.params)
      if (instanceErr) return res(instanceErr)
      if (instance.run_state !== 'stopped') {
        return res(badRequest('instance must be stopped'))
      }

      const body = await req.json()
      const [disk, diskErr] = lookupDisk({ ...req.params, diskName: body.name })
      if (diskErr) return res(diskErr)
      disk.state = {
        state: 'detached',
      }
      return res(json(disk))
    }
  ),

  rest.get<never, PP.Instance, Json<Api.ExternalIpResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips',
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

  rest.get<never, PP.Instance, Json<Api.NetworkInterfaceResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
      return res(json(paginated(req.url.search, nics)))
    }
  ),

  rest.post<
    Json<Api.NetworkInterfaceCreate>,
    PP.Instance,
    Json<Api.NetworkInterface> | PostErr
  >(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
    async (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const nicsForInstance = db.networkInterfaces.filter(
        (n) => n.instance_id === instance.id
      )

      const body = await req.json()
      const alreadyExists = nicsForInstance.some((n) => n.name === body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const { name, description, subnet_name, vpc_name, ip } = body

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

  rest.get<never, PP.NetworkInterface, Json<Api.NetworkInterface> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    (req, res) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)
      return res(json(nic))
    }
  ),

  rest.put<
    Json<Api.NetworkInterfaceUpdate>,
    PP.NetworkInterface,
    Json<Api.NetworkInterface> | PostErr
  >(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    async (req, res, ctx) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (body.name) {
        nic.name = body.name
      }
      if (typeof body.description === 'string') {
        nic.description = body.description
      }
      if (typeof body.primary === 'boolean' && body.primary !== nic.primary) {
        if (nic.primary) {
          return res(badRequest('Cannot remove the primary interface'))
        }
        db.networkInterfaces
          .filter((n) => n.instance_id === nic.instance_id)
          .forEach((n) => {
            n.primary = false
          })
        nic.primary = !!body.primary
      }
      return res(ctx.status(204))
    }
  ),

  rest.delete<never, PP.NetworkInterface, GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
    (req, res, ctx) => {
      const [nic, err] = lookupNetworkInterface(req.params)
      if (err) return res(err)
      db.networkInterfaces = db.networkInterfaces.filter((n) => n.id !== nic.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.Instance, Json<Api.InstanceSerialConsoleData> | GetErr>(
    '/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console',
    (req, res) => {
      // TODO: Add support for query params
      return res(json(serial))
    }
  ),

  rest.get<never, PP.Project, Json<Api.DiskResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/disks',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const disks = db.disks.filter((d) => d.project_id === project.id)
      return res(json(paginated(req.url.search, disks)))
    }
  ),

  rest.post<Json<Api.DiskCreate>, PP.Project, Json<Api.Disk> | PostErr>(
    '/organizations/:orgName/projects/:projectName/disks',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.disks.some(
        (s) => s.project_id === project.id && s.name === body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

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
      return res(json(newDisk, { status: 201 }))
    }
  ),

  rest.delete<never, PP.Disk, GetErr>(
    '/organizations/:orgName/projects/:projectName/disks/:diskName',
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

  /**
   * Approach to faking: always return 1000 data points spread evenly between start
   * and end.
   */
  rest.get<never, PP.DiskMetric, Json<Api.MeasurementResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName',
    (req, res) => {
      const [, err] = lookupDisk(req.params)
      if (err) return res(err)

      const queryStartTime = getDateParam(req.url.searchParams, 'start_time')
      const queryEndTime = getDateParam(req.url.searchParams, 'end_time')

      // if no start time or end time, give the last 24 hours. in this case the
      // API will give all data available for the metric (paginated of course),
      // so essentially we're pretending the last 24 hours just happens to be
      // all the data. if we have an end time but no start time, same deal, pretend
      // 24 hours before the given end time is where it starts
      const now = new Date()
      const endTime = queryEndTime || now
      const startTime = queryStartTime || subHours(endTime, 24)

      if (endTime <= startTime) return res(json({ items: [] }))

      return res(
        json({
          items: genCumulativeI64Data(
            new Array(1000).fill(0).map((x, i) => Math.floor(Math.tanh(i / 500) * 3000)),
            startTime,
            endTime
          ),
        })
      )
    }
  ),

  rest.get<never, PP.Project, Json<Api.ImageResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/images',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const images = db.images.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, images)))
    }
  ),

  rest.get<never, PP.Project, Json<Api.SnapshotResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/snapshots',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
      return res(json(paginated(req.url.search, snapshots)))
    }
  ),

  rest.post<Json<Api.SnapshotCreate>, PP.Project, Json<Api.Snapshot> | PostErr>(
    '/organizations/:orgName/projects/:projectName/snapshots',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.snapshots.some((s) => s.name === body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      if (!body.disk) {
        return res(badRequest('disk to snapshot is required'))
      }

      const [disk, diskErr] = lookupDisk({ ...req.params, diskName: body.disk })

      if (diskErr) {
        return res(diskErr)
      }

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
      return res(json(newSnapshot, { status: 201 }))
    }
  ),

  rest.get<never, PP.Snapshot, Json<Api.Snapshot> | GetErr>(
    '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
    (req, res) => {
      const [snapshot, err] = lookupSnapshot(req.params)
      if (err) return res(err)

      return res(json(snapshot))
    }
  ),

  rest.delete<never, PP.Snapshot, GetErr>(
    '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
    (req, res, ctx) => {
      const [snapshot, err] = lookupSnapshot(req.params)
      if (err) return res(err)
      db.snapshots = db.snapshots.filter((s) => s.id !== snapshot.id)
      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.Project, Json<Api.VpcResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
      return res(json(paginated(req.url.search, vpcs)))
    }
  ),

  rest.get<never, PP.Vpc, Json<Api.Vpc> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      return res(json(vpc))
    }
  ),

  rest.post<Json<Api.VpcCreate>, PP.Project, Json<Api.Vpc> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs',
    async (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.vpcs.some(
        (s) => s.project_id === project.id && s.name === body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

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

      return res(json(newVpc, { status: 201 }))
    }
  ),

  rest.put<Json<Api.Vpc>, PP.Vpc, Json<Api.Vpc> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    async (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (body.name) {
        vpc.name = body.name
      }

      if (typeof body.description === 'string') {
        vpc.description = body.description
      }

      if (body.dns_name) {
        vpc.dns_name = body.dns_name
      }
      return res(json(vpc))
    }
  ),

  rest.delete<never, PP.Vpc, GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

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

      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.Vpc, Json<Api.VpcSubnetResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const subnets = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
      return res(json(paginated(req.url.search, subnets)))
    }
  ),

  rest.post<Json<Api.VpcSubnetCreate>, PP.Vpc, Json<Api.VpcSubnet> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    async (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.vpcSubnets.some(
        (s) => s.vpc_id === vpc.id && s.name === body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

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
      return res(json(newSubnet, { status: 201 }))
    }
  ),

  rest.put<Json<Api.VpcSubnetUpdate>, PP.VpcSubnet, Json<Api.VpcSubnet> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
    async (req, res, ctx) => {
      const [subnet, err] = lookupVpcSubnet(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (body.name) {
        subnet.name = body.name
      }
      if (typeof body.description === 'string') {
        subnet.description = body.description
      }
      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.Vpc, Json<Api.VpcFirewallRules> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const rules = db.vpcFirewallRules.filter((r) => r.vpc_id === vpc.id)
      return res(json({ rules: sortBy(rules, (r) => r.name) }))
    }
  ),

  rest.put<
    Json<Api.VpcFirewallRuleUpdateParams>,
    PP.Vpc,
    Json<Api.VpcFirewallRules> | PostErr
  >(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
    async (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const body = await req.json()
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
      return res(json({ rules: sortBy(rules, (r) => r.name) }))
    }
  ),

  rest.get<never, PP.Vpc, Json<Api.VpcRouterResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const routers = db.vpcRouters.filter((s) => s.vpc_id === vpc.id)
      return res(json(paginated(req.url.search, routers)))
    }
  ),

  rest.post<Json<Api.VpcRouterCreate>, PP.Vpc, Json<Api.VpcRouter> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
    async (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)

      const body = await req.json()
      const alreadyExists = db.vpcRouters.some(
        (x) => x.vpc_id === vpc.id && x.name === body.name
      )
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }

      const newRouter: Json<Api.VpcRouter> = {
        id: genId('vpc-router'),
        vpc_id: vpc.id,
        kind: 'custom',
        ...body,
        ...getTimestamps(),
      }
      db.vpcRouters.push(newRouter)
      return res(json(newRouter, { status: 201 }))
    }
  ),

  rest.put<Json<Api.VpcRouterUpdate>, PP.VpcRouter, Json<Api.VpcRouter> | PostErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
    async (req, res, ctx) => {
      const [router, err] = lookupVpcRouter(req.params)
      if (err) return res(err)

      const body = await req.json()
      if (body.name) {
        router.name = body.name
      }
      if (typeof body.description === 'string') {
        router.description = body.description
      }
      return res(ctx.status(204))
    }
  ),

  rest.get<never, PP.VpcRouter, Json<Api.RouterRouteResultsPage> | GetErr>(
    '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
    (req, res) => {
      const [router, err] = lookupVpcRouter(req.params)
      if (err) return res(err)
      const routers = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
      return res(json(paginated(req.url.search, routers)))
    }
  ),

  rest.get<never, never, Json<Api.GlobalImageResultsPage> | GetErr>(
    '/system/images',
    (req, res) => {
      return res(json(paginated(req.url.search, db.globalImages)))
    }
  ),

  rest.get<never, PP.GlobalImage, Json<Api.GlobalImage> | GetErr>(
    '/system/images/:imageName',
    (req, res) => {
      const [image, err] = lookupGlobalImage(req.params)
      if (err) return res(err)
      return res(json(image))
    }
  ),

  rest.get<never, never, Json<Api.SiloResultsPage> | GetErr>(
    '/system/silos',
    (req, res) => {
      return res(json(paginated(req.url.search, db.silos)))
    }
  ),

  rest.post<Json<Api.SiloCreate>, never, Json<Api.Silo> | PostErr>(
    '/system/silos',
    async (req, res) => {
      const body = await req.json()
      const alreadyExists = db.silos.some((x) => x.name === body.name)
      if (alreadyExists) return res(alreadyExistsErr)

      if (!body.name) {
        return res(badRequest('name requires at least one character'))
      }
      if (typeof body.discoverable !== 'boolean') {
        return res(badRequest('discoverable must be provided'))
      }
      if (!body.identity_mode) {
        return res(badRequest('identity_mode must be provided'))
      }

      const newSilo: Json<Api.Silo> = {
        id: genId('silo'),
        ...body,
        ...getTimestamps(),
      }
      db.silos.push(newSilo)
      return res(json(newSilo, { status: 201 }))
    }
  ),

  rest.get<never, PP.Silo, Json<Api.Silo> | GetErr>(
    '/system/silos/:siloName',
    (req, res) => {
      const [silo, err] = lookupSilo(req.params)
      if (err) return res(err)
      return res(json(silo))
    }
  ),

  rest.delete<never, PP.Silo, Json<Api.Silo> | GetErr>(
    '/system/silos/:siloName',
    (req, res) => {
      const [silo, err] = lookupSilo(req.params)
      if (err) return res(err)
      db.silos = db.silos.filter((x) => x.id !== silo.id)
      return res(json(silo))
    }
  ),

  // note that in the API this is meant for system users, but that could change.
  // kind of a hack to pretend it's about normal users.
  // see https://github.com/oxidecomputer/omicron/issues/1235
  rest.get<never, never, Json<Api.UserResultsPage> | GetErr>('/users', (req, res) => {
    return res(json(paginated(req.url.search, db.users)))
  }),

  rest.post<Json<Api.DeviceAuthVerify>, never, PostErr>(
    '/device/confirm',
    async (req, res, ctx) => {
      const body = await req.json()
      if (body.user_code === 'BADD-CODE') {
        return res(ctx.status(404))
      }
      return res(ctx.status(200))
    }
  ),

  getById('/by-id/organizations/:id', db.orgs),
  getById('/by-id/projects/:id', db.projects),
  getById('/by-id/instances/:id', db.instances),
  getById('/by-id/network-interfaces/:id', db.networkInterfaces),
  getById('/by-id/vpcs/:id', db.vpcs),
  getById('/by-id/vpc-subnets/:id', db.vpcSubnets),
  getById('/by-id/vpc-routers/:id', db.vpcRouters),
  getById('/by-id/vpc-router-routes/:id', db.vpcRouterRoutes),
  getById('/by-id/disks/:id', db.disks),
  getById('/system/by-id/images/:id', db.globalImages),
  getById('/by-id/images/:id', db.images),
  getById('/by-id/snapshots/:id', db.snapshots),
]
