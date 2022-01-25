import type { ResponseTransformer } from 'msw'
import { rest, context, compose } from 'msw'
import { sessionMe } from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'
import type { notFoundErr, OrgParams, ProjectParams, VpcParams } from './db'
import { db, lookupOrg, lookupProject, lookupVpc } from './db'
import { mapObj } from './map-obj'

/// generate random 11 digit hex string
const randomHex = () => Math.floor(Math.random() * 10e12).toString(16)

type GetErr = typeof notFoundErr
type PostErr = typeof alreadyExistsErr | typeof notFoundErr

type Empty = Record<string, never>

function getTimestamps() {
  const now = new Date()
  return {
    timeCreated: now,
    timeModified: now,
  }
}

const camelToSnake = (s: string) =>
  s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase())

const dateToStr = (k: string | undefined, v: unknown) =>
  v instanceof Date ? v.toISOString() : v

/** Custom transformer: snake case keys, stringify dates, attach status. */
// The real API stores things internally in snake case and (more importantly)
// serializes them in snake case, and of course dates in JSON must be strings.
// The problem is our mock DB uses the API types, and it would be pretty
// inconvenient to do otherwise because that's all we have. If the API client
// defined both API-side types (snake case and dates as strings) and
// post-processed JS-friendly types (the ones we have now), we could use the
// API-side types as our DB types and our response types and do explicit
// conversion in the handlers. Instead, what we're doing here is storing
// everything in client-side types and only snakeifying and stringifying dates
// at serialization time.
function json<T>(o: T, status = 200): ResponseTransformer<T> {
  const data = mapObj(camelToSnake, dateToStr)(o)
  return compose(context.status(status), context.json(data))
}

const alreadyExistsErr = { errorCode: 'ObjectAlreadyExists' }

export const handlers = [
  rest.get('/api/session/me', (req, res) => {
    return res(json(sessionMe))
  }),

  rest.get<Empty, Empty, Api.OrganizationResultsPage>(
    '/api/organizations',
    (req, res) => {
      return res(json({ items: db.orgs }))
    }
  ),

  rest.post<Api.OrganizationCreate, Empty, Api.Organization | PostErr>(
    '/api/organizations',
    (req, res) => {
      const alreadyExists = db.orgs.some((o) => o.name === req.body.name)
      if (alreadyExists) return res(json(alreadyExistsErr, 400))

      const newOrg = {
        id: 'org-' + randomHex(),
        ...req.body,
        ...getTimestamps(),
      }
      db.orgs.push(newOrg)
      return res(json(newOrg, 201))
    }
  ),

  rest.get<Empty, OrgParams, Api.Organization | GetErr>(
    '/api/organizations/:orgName',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      return res(json(org.ok))
    }
  ),

  rest.get<Empty, OrgParams, Api.ProjectResultsPage | GetErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const projects = db.projects.filter((p) => p.organizationId === org.ok.id)
      return res(json({ items: projects }))
    }
  ),

  rest.post<Api.ProjectCreate, OrgParams, Api.Project | PostErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      console.log(req.params)
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const alreadyExists = db.projects.some(
        (p) => p.organizationId === org.ok.id && p.name === req.body.name
      )

      if (alreadyExists) res(json(alreadyExistsErr, 400))

      const newProject = {
        id: 'project-' + randomHex(),
        organizationId: org.ok.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.projects.push(newProject)
      return res(json(newProject, 201))
    }
  ),

  rest.get<Empty, ProjectParams, Api.Project | GetErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      return res(json(project.ok))
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
      return res(json({ items: instances }))
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
        return res(json(alreadyExistsErr, 400))
      }

      const newInstance: Api.Instance = {
        id: 'instance-' + randomHex(),
        projectId: project.ok.id,
        ...req.body,
        ...getTimestamps(),
        runState: 'stopped',
        timeRunStateUpdated: new Date(),
      }
      db.instances.push(newInstance)
      return res(json(newInstance, 201))
    }
  ),

  rest.get<Empty, ProjectParams, Api.DiskResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const disks = db.disks.filter((d) => d.projectId === project.ok.id)
      return res(json({ items: disks }))
    }
  ),

  rest.get<Empty, ProjectParams, Api.VpcResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const vpcs = db.vpcs.filter((v) => v.projectId === project.ok.id)
      return res(json({ items: vpcs }))
    }
  ),

  rest.get<Empty, VpcParams, Api.Vpc | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      return res(json(vpc.ok))
    }
  ),

  rest.get<Empty, VpcParams, Api.VpcSubnetResultsPage | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      const items = db.vpcSubnets.filter((s) => s.vpcId === vpc.ok.id)
      return res(json({ items }))
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
      if (alreadyExists) res(json(alreadyExistsErr, 400))

      const newSubnet = {
        id: 'vpc-subnet-' + randomHex(),
        vpcId: vpc.ok.id,
        dnsName: req.body.name,
        ...req.body,
        ...getTimestamps(),
      }
      db.vpcSubnets.push(newSubnet)
      return res(json(newSubnet, 201))
    }
  ),
]
