import type { ResponseTransformer } from 'msw'
import { rest, context, compose } from 'msw'
import { sessionMe } from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'
import type { notFoundErr, OrgParams, ProjectParams, VpcParams } from './db'
import { db, lookupOrg, lookupProject, lookupVpc } from './db'
import { mapObj } from './map-obj'

/// generate random 11 digit hex string
const randomHex = () => Math.floor(Math.random() * 10e12).toString(16)

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

const apiify = mapObj(camelToSnake, dateToStr)

/**
 * Custom transformer: snake case keys and stringify dates like the real Nexus.
 *
 * Because our camel-cased and date-parsed API types are all we get from the
 * generated client, it's convenient to use them everywhere in the mock server,
 * including the objects in the mock DB. However, we also need to return
 * realistic API responses, which are snake-cased and have stringified dates. So
 * we deal with our client-side API types as long as we can, right up until
 * serialization time. When a POST comes in, the body is snake-cased because the
 * client is doing the right thing as far as the real API is concerned. TODO: we
 * should be camelizing and date-parsing request bodies when they come in. Ugh.
 *
 * It might be less error-prone to do this transformation in something like a
 * middleware, but that doesn't seem like a thing in MSW.
 *
 * Note that the B in the return type is a lie! The incoming value is of course
 * a B, but once it's transformed, it should really be something like
 * `Snakify<DateToStr<B>>`. (`mapObj` returns `any`, so we can just cast to what
 * we want.) This lie is convenient because it lets us annotate, say, GET
 * project with a response type of `Project` even though technically it's
 * `Snakify<DateToStr<Project>>`. We could, of course, do this properly but it's
 * a lot of noise with little additional value as long as you remember the One
 * Weird Trick.
 *
 * It _would_ be easy to forget to call this on every response, except that
 * calling res() with a plain object is an error anyway. This `json()` is
 * replacing `ctx.json()`.
 */
export const json = <B>(body: B, status = 200): ResponseTransformer<B> =>
  compose(context.status(status), context.json(apiify(body)))

const alreadyExistsErr = { errorCode: 'ObjectAlreadyExists' } as const

type Empty = Record<string, never>

type GetErr = typeof notFoundErr
type PostErr = typeof alreadyExistsErr | typeof notFoundErr

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
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const alreadyExists = db.projects.some(
        (p) => p.organizationId === org.ok.id && p.name === req.body.name
      )

      if (alreadyExists) return res(json(alreadyExistsErr, 400))

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
      if (alreadyExists) return res(json(alreadyExistsErr, 400))

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
