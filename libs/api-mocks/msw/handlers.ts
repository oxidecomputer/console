import { rest } from 'msw'
import { sessionMe } from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'
import type { notFoundErr, OrgParams, ProjectParams, VpcParams } from './db'
import { db, lookupOrg, lookupProject, lookupVpc } from './db'

const alreadyExistsErr = { errorCode: 'ObjectAlreadyExists' }

/// generate random 11 digit hex string
const randomHex = () => Math.floor(Math.random() * 10e12).toString(16)

type GetErr = typeof notFoundErr
type PostErr = typeof alreadyExistsErr | typeof notFoundErr

type Empty = Record<string, never>

function getTimestamps() {
  const now = new Date().toISOString()
  return {
    timeCreated: now,
    timeModified: now,
  }
}

export const handlers = [
  rest.get('/api/session/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(sessionMe))
  }),

  rest.get<Empty, Empty, Api.OrganizationResultsPage>(
    '/api/organizations',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ items: db.orgs }))
    }
  ),

  rest.post<Api.OrganizationCreate, Empty, Api.Organization | PostErr>(
    '/api/organizations',
    (req, res, ctx) => {
      const alreadyExists = db.orgs.some((o) => o.name === req.body.name)
      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newOrg = {
        id: 'org-' + randomHex(),
        ...req.body,
        ...getTimestamps(),
      }
      db.orgs.push(newOrg)
      return res(ctx.status(201), ctx.json(newOrg))
    }
  ),

  rest.get<Empty, OrgParams, Api.Organization | GetErr>(
    '/api/organizations/:orgName',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      return res(ctx.status(200), ctx.json(org.ok))
    }
  ),

  rest.get<Empty, OrgParams, Api.ProjectResultsPage | GetErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const projects = db.projects.filter((p) => p.organizationId === org.ok.id)
      return res(ctx.status(200), ctx.json({ items: projects }))
    }
  ),

  rest.post<Api.ProjectCreate, OrgParams, Api.Project | PostErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const alreadyExists = db.projects.some(
        (p) => p.organizationId === org.ok.id && p.name === req.body.name
      )

      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newProject = {
        id: 'project-' + randomHex(),
        organizationId: org.ok.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.projects.push(newProject)
      return res(ctx.status(201), ctx.json(newProject))
    }
  ),

  rest.get<Empty, ProjectParams, Api.Project | GetErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      return res(ctx.status(200), ctx.json(project.ok))
    }
  ),

  rest.get<Empty, ProjectParams, Api.InstanceResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const instances = db.instances.filter(
        (i) => i.projectId === project.ok.id
      )
      return res(ctx.status(200), ctx.json({ items: instances }))
    }
  ),

  rest.post<Api.InstanceCreate, ProjectParams, Api.Instance | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err

      const alreadyExists = db.instances.some(
        (i) => i.projectId === project.ok.id && i.name === req.body.name
      )
      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newInstance: Api.Instance = {
        id: 'instance-' + randomHex(),
        projectId: project.ok.id,
        ...req.body,
        ...getTimestamps(),
        runState: 'stopped',
        timeRunStateUpdated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(ctx.status(201), ctx.json(newInstance))
    }
  ),

  rest.get<Empty, ProjectParams, Api.DiskResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const disks = db.disks.filter((d) => d.projectId === project.ok.id)
      return res(ctx.status(200), ctx.json({ items: disks }))
    }
  ),

  rest.get<Empty, ProjectParams, Api.VpcResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const vpcs = db.vpcs.filter((v) => v.projectId === project.ok.id)
      return res(ctx.status(200), ctx.json({ items: vpcs }))
    }
  ),

  rest.get<Empty, VpcParams, Api.Vpc | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      return res(ctx.status(200), ctx.json(vpc.ok))
    }
  ),

  rest.get<Empty, VpcParams, Api.VpcSubnetResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      const items = db.vpcSubnets.filter((s) => s.vpcId === vpc.ok.id)
      return res(ctx.status(200), ctx.json({ items }))
    }
  ),

  rest.post<Api.VpcSubnetCreate, VpcParams, Api.VpcSubnet | PostErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err

      const alreadyExists = db.vpcSubnets.some(
        (s) => s.vpcId === vpc.ok.id && s.name === req.body.name
      )
      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newSubnet = {
        id: 'vpc-subnet-' + randomHex(),
        vpcId: vpc.ok.id,
        dnsName: req.body.name,
        ...req.body,
        ...getTimestamps(),
      }
      db.vpcSubnets.push(newSubnet)
      return res(ctx.status(201), ctx.json(newSubnet))
    }
  ),
]
