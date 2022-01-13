import crypto from 'crypto'
import { rest } from 'msw'
import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'

type ToRecord<Obj> = Record<keyof Obj, string>

const alreadyExistsErr = { error_code: 'ObjectAlreadyExists' }
const notFoundErr = { error_code: 'ObjectNotFound' }

type GetErr = typeof notFoundErr
type PostErr = typeof alreadyExistsErr | typeof notFoundErr

type NoBody = Record<string, never>

function getTimestamps() {
  const now = new Date().toISOString()
  return {
    timeCreated: now,
    timeModified: now,
  }
}

const initDb = {
  orgs: [mock.org],
  projects: [mock.project],
  instances: [mock.instance],
  disks: [mock.disk],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
}

const clone = (o: unknown) => JSON.parse(JSON.stringify(o))

export function resetDb() {
  db = clone(initDb)
}

let db: typeof initDb = clone(initDb)

export const handlers = [
  rest.get('/api/session/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mock.sessionMe))
  }),

  rest.get<
    NoBody,
    ToRecord<Api.OrganizationsGetParams>,
    Api.OrganizationResultsPage
  >('/api/organizations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: db.orgs }))
  }),

  rest.post<
    Api.OrganizationCreate,
    ToRecord<Api.OrganizationsPostParams>,
    Api.Organization | PostErr
  >('/api/organizations', (req, res, ctx) => {
    const alreadyExists = db.orgs.some((o) => o.name === req.body.name)
    if (alreadyExists) {
      return res(ctx.status(400), ctx.json(alreadyExistsErr))
    }

    const newOrg = {
      id: 'org-' + crypto.randomUUID(),
      ...req.body,
      ...getTimestamps(),
    }
    db.orgs.push(newOrg)
    return res(ctx.status(201), ctx.json(newOrg))
  }),

  rest.get<
    NoBody,
    ToRecord<Api.OrganizationsGetOrganizationParams>,
    Api.Organization | GetErr
  >('/api/organizations/:orgName', (req, res, ctx) => {
    const org = db.orgs.find((o) => o.name === req.params.orgName)
    if (!org) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }
    return res(ctx.status(200), ctx.json(org))
  }),

  rest.get<
    NoBody,
    ToRecord<Api.OrganizationProjectsGetParams>,
    Api.ProjectResultsPage | GetErr
  >('/api/organizations/:orgName/projects', (req, res, ctx) => {
    const org = db.orgs.find((org) => org.name === req.params.orgName)
    if (!org) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }

    return res(ctx.status(200), ctx.json({ items: db.projects }))
  }),

  rest.post<
    Api.ProjectCreate,
    ToRecord<Api.OrganizationProjectsPostParams>,
    Api.Project | PostErr
  >('/api/organizations/:orgName/projects', (req, res, ctx) => {
    const org = db.orgs.find((org) => org.name === req.params.orgName)
    if (!org) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }

    const { name, description } = req.body

    const alreadyExists = db.projects.some(
      (p) => p.organizationId === org.id && p.name === name
    )

    if (alreadyExists) {
      return res(ctx.status(400), ctx.json(alreadyExistsErr))
    }

    const newProject = {
      id: 'project-' + crypto.randomUUID(),
      organizationId: mock.org.id,
      name,
      description,
      ...getTimestamps(),
    }
    db.projects.push(newProject)
    return res(ctx.status(201), ctx.json(newProject))
  }),

  rest.get<
    NoBody,
    ToRecord<Api.OrganizationProjectsGetProjectParams>,
    Api.Project | GetErr
  >('/api/organizations/:orgName/projects/:projectName', (req, res, ctx) => {
    const org = db.orgs.find((org) => org.name === req.params.orgName)
    if (!org) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }
    const project = db.projects.find(
      (p) => p.organizationId === org.id && p.name === req.params.projectName
    )
    if (!project) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }
    return res(ctx.status(200), ctx.json(project))
  }),

  rest.get<
    NoBody,
    ToRecord<Api.ProjectInstancesGetParams>,
    Api.InstanceResultsPage | GetErr
  >(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const instances = db.instances.filter((i) => i.projectId === project.id)
      return res(ctx.status(200), ctx.json({ items: instances }))
    }
  ),

  rest.post<
    Api.InstanceCreate,
    ToRecord<Api.ProjectInstancesPostParams>,
    Api.Instance | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }

      const alreadyExists = db.instances.some(
        (i) => i.projectId === project.id && i.name === req.body.name
      )
      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newInstance: Api.Instance = {
        id: 'instance-' + crypto.randomUUID(),
        projectId: project.id,
        ...req.body,
        ...getTimestamps(),
        runState: 'stopped',
        timeRunStateUpdated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(ctx.status(201), ctx.json(newInstance))
    }
  ),

  rest.get<
    NoBody,
    ToRecord<Api.ProjectDisksGetParams>,
    Api.DiskResultsPage | GetErr
  >(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const disks = db.disks.filter((d) => d.projectId === project.id)
      return res(ctx.status(200), ctx.json({ items: disks }))
    }
  ),

  rest.get<
    NoBody,
    ToRecord<Api.ProjectVpcsGetParams>,
    Api.VpcResultsPage | GetErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const vpcs = db.vpcs.filter((v) => v.projectId === project.id)
      return res(ctx.status(200), ctx.json({ items: vpcs }))
    }
  ),

  rest.get<NoBody, ToRecord<Api.ProjectVpcsGetVpcParams>, Api.Vpc | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const vpc = db.vpcs.find(
        (v) => v.projectId === project.id && v.name === req.params.vpcName
      )
      if (!vpc) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      return res(ctx.status(200), ctx.json(vpc))
    }
  ),

  rest.get<
    NoBody,
    ToRecord<Api.VpcSubnetsGetParams>,
    Api.VpcSubnetResultsPage | GetErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const vpc = db.vpcs.find(
        (v) => v.projectId === project.id && v.name === req.params.vpcName
      )
      if (!vpc) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const items = db.vpcSubnets.filter((s) => s.vpcId === vpc.id)
      return res(ctx.status(200), ctx.json({ items }))
    }
  ),

  rest.post<
    Api.VpcSubnetCreate,
    ToRecord<Api.VpcSubnetsPostParams>,
    Api.VpcSubnet | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const org = db.orgs.find((org) => org.name === req.params.orgName)
      if (!org) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const project = db.projects.find(
        (p) => p.organizationId === org.id && p.name === req.params.projectName
      )
      if (!project) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const vpc = db.vpcs.find(
        (v) => v.projectId === project.id && v.name === req.params.vpcName
      )
      if (!vpc) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }

      const alreadyExists = db.vpcSubnets.some(
        (s) => s.vpcId === vpc.id && s.name === req.body.name
      )
      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newSubnet = {
        id: 'vpc-subnet-' + crypto.randomUUID(),
        vpcId: vpc.id,
        dnsName: req.body.name,
        ...req.body,
        ...getTimestamps(),
      }
      db.vpcSubnets.push(newSubnet)
      return res(ctx.status(201), ctx.json(newSubnet))
    }
  ),
]
