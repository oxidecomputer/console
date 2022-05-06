import { rest, context, compose } from 'msw'
import type { ApiTypes as Api } from '@oxide/api'
import { sortBy } from '@oxide/util'
import type { Json } from '../json-type'
import { json } from './util'
import { sessionMe } from '../session'
import type {
  NotFound,
  InstanceParams,
  OrgParams,
  ProjectParams,
  VpcParams,
  VpcSubnetParams,
  DiskParams,
  VpcRouterParams,
} from './db'
import { lookupDisk } from './db'
import {
  db,
  lookupInstance,
  lookupOrg,
  lookupProject,
  lookupVpc,
  lookupVpcSubnet,
  lookupVpcRouter,
} from './db'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

/// generate random 11 digit hex string, prefix optional
const genId = (prefix?: string) =>
  (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 10e12).toString(16)

function getTimestamps() {
  const now = new Date().toISOString()
  return { time_created: now, time_modified: now }
}

const alreadyExistsBody = { error_code: 'ObjectAlreadyExists' } as const
type AlreadyExists = typeof alreadyExistsBody
const alreadyExistsErr = json(alreadyExistsBody, 400)

const unavailableBody = { error_code: 'ServiceUnavailable' } as const
type Unavailable = typeof unavailableBody
const unavailableErr = json(unavailableBody, 503)

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

  rest.get<never, never, Json<Api.OrganizationResultsPage>>(
    '/api/organizations',
    (req, res) => res(json({ items: db.orgs }))
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
      return res(json(newOrg, 201))
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

  rest.get<never, OrgParams, Json<Api.ProjectResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects',
    (req, res) => {
      const [org, err] = lookupOrg(req.params)
      if (err) return res(err)

      const projects = db.projects.filter((p) => p.organization_id === org.id)
      return res(json({ items: projects }))
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
      return res(json(newProject, 201))
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

  rest.get<never, ProjectParams, Json<Api.InstanceResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const instances = db.instances.filter((i) => i.project_id === project.id)
      return res(json({ items: instances }))
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
        ...req.body,
        ...getTimestamps(),
        run_state: 'running',
        time_run_state_updated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(json(newInstance, 201))
    }
  ),

  rest.post<never, InstanceParams, Json<Api.Instance> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/start',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'running'
      return res(json(instance, 202))
    }
  ),

  rest.post<never, InstanceParams, Json<Api.Instance> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/stop',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      instance.run_state = 'stopped'
      return res(json(instance, 202))
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
      return res(json({ items: disks }))
    }
  ),

  rest.post<never, DiskParams, Json<Api.Disk> | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/disks',
    (req, res) => {
      const [disk, err] = lookupDisk(req.params)
      if (err) return res(err)
      return res(json(disk))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.NetworkInterfaceResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
    (req, res) => {
      const [instance, err] = lookupInstance(req.params)
      if (err) return res(err)
      const nics = db.networkInterfaces.filter((n) => n.instance_id === instance.id)
      return res(json({ items: nics }))
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
      const alreadyExists = db.networkInterfaces.some(
        (n) => n.instance_id === instance.id && n.name === req.body.name
      )
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

      // TODO: look up vpc and subnet to make sure they exist and get the IDs off them
      const newNic: Json<Api.NetworkInterface> = {
        id: genId('nic'),
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

  rest.get<never, ProjectParams, Json<Api.DiskResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const disks = db.disks.filter((d) => d.project_id === project.id)
      return res(json({ items: disks }))
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
        block_size: disk_source.type === 'Blank' ? disk_source.block_size : 4096,
        ...getTimestamps(),
      }
      db.disks.push(newDisk)
      return res(json(newDisk, 201))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.ImageResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/images',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const images = db.images.filter((i) => i.project_id === project.id)
      return res(json({ items: images }))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.SnapshotResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/snapshots',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const snapshots = db.snapshots.filter((i) => i.project_id === project.id)
      return res(json({ items: snapshots }))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.VpcResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res) => {
      const [project, err] = lookupProject(req.params)
      if (err) return res(err)
      const vpcs = db.vpcs.filter((v) => v.project_id === project.id)
      return res(json({ items: vpcs }))
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
      return res(json(newVpc, 201))
    }
  ),

  rest.get<never, VpcParams, Json<Api.VpcSubnetResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res) => {
      const [vpc, err] = lookupVpc(req.params)
      if (err) return res(err)
      const items = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
      return res(json({ items }))
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
      return res(json(newSubnet, 201))
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
      if (req.body.ipv4_block) {
        subnet.ipv4_block = req.body.ipv4_block
      }
      if (req.body.ipv6_block) {
        subnet.ipv6_block = req.body.ipv6_block
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
      const items = db.vpcRouters.filter((s) => s.vpc_id === vpc.id)
      return res(json({ items }))
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
      return res(json(newRouter, 201))
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
      const items = db.vpcRouterRoutes.filter((s) => s.vpc_router_id === router.id)
      return res(json({ items }))
    }
  ),
]
