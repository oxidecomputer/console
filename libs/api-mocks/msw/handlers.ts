import type { ResponseTransformer } from 'msw'
import { rest, context, compose } from 'msw'
import type { ApiTypes as Api } from '@oxide/api'
import type { Json } from '../json-type'
import { sessionMe } from '../session'
import type {
  notFoundErr,
  InstanceParams,
  OrgParams,
  ProjectParams,
  VpcParams,
} from './db'
import { db, lookupInstance, lookupOrg, lookupProject, lookupVpc } from './db'

// Note the *JSON types. Those represent actual API request and response bodies,
// the snake-cased objects coming straight from the API before the generated
// client camel-cases the keys and parses date fields. Inside the mock API everything
// is *JSON type.

/// generate random 11 digit hex string
const randomHex = () => Math.floor(Math.random() * 10e12).toString(16)

function getTimestamps() {
  const now = new Date().toISOString()
  return { time_created: now, time_modified: now }
}

/**
 * Custom transformer: convenience function for less typing. Equivalent to
 * `res(ctx.status(status), ctx.json(body))` in a handler.
 *
 * https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export const json = <B>(body: B, status = 200): ResponseTransformer<B> =>
  compose(context.status(status), context.json(body))

const alreadyExistsErr = { error_code: 'ObjectAlreadyExists' } as const

type GetErr = typeof notFoundErr
type PostErr = typeof alreadyExistsErr | typeof notFoundErr

export const handlers = [
  rest.get('/api/session/me', (req, res) => res(json(sessionMe))),

  rest.get<never, never, Json<Api.OrganizationResultsPage>>(
    '/api/organizations',
    (req, res) => res(json({ items: db.orgs }))
  ),

  rest.post<
    Json<Api.OrganizationCreate>,
    never,
    Json<Api.Organization> | PostErr
  >('/api/organizations', (req, res) => {
    const alreadyExists = db.orgs.some((o) => o.name === req.body.name)
    if (alreadyExists) return res(json(alreadyExistsErr, 400))

    const newOrg: Json<Api.Organization> = {
      id: 'org-' + randomHex(),
      ...req.body,
      ...getTimestamps(),
    }
    db.orgs.push(newOrg)
    return res(json(newOrg, 201))
  }),

  rest.get<never, OrgParams, Json<Api.Organization> | GetErr>(
    '/api/organizations/:orgName',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      return res(json(org.ok))
    }
  ),

  rest.get<never, OrgParams, Json<Api.ProjectResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const projects = db.projects.filter(
        (p) => p.organization_id === org.ok.id
      )
      return res(json({ items: projects }))
    }
  ),

  rest.post<Json<Api.ProjectCreate>, OrgParams, Json<Api.Project> | PostErr>(
    '/api/organizations/:orgName/projects',
    (req, res, ctx) => {
      const org = lookupOrg(req, res, ctx)
      if (org.err) return org.err

      const alreadyExists = db.projects.some(
        (p) => p.organization_id === org.ok.id && p.name === req.body.name
      )

      if (alreadyExists) return res(json(alreadyExistsErr, 400))

      const newProject: Json<Api.Project> = {
        id: 'project-' + randomHex(),
        organization_id: org.ok.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.projects.push(newProject)
      return res(json(newProject, 201))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.Project> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      return res(json(project.ok))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.InstanceResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const instances = db.instances.filter(
        (i) => i.project_id === project.ok.id
      )
      return res(json({ items: instances }))
    }
  ),

  rest.get<never, InstanceParams, Json<Api.Instance> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/instances/:instanceName',
    (req, res, ctx) => {
      const instance = lookupInstance(req, res, ctx)
      if (instance.err) return instance.err
      return res(json(instance.ok))
    }
  ),

  rest.post<
    Json<Api.InstanceCreate>,
    ProjectParams,
    Json<Api.Instance> | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err

      const alreadyExists = db.instances.some(
        (i) => i.project_id === project.ok.id && i.name === req.body.name
      )
      if (alreadyExists) {
        return res(json(alreadyExistsErr, 400))
      }

      const newInstance: Json<Api.Instance> = {
        id: 'instance-' + randomHex(),
        project_id: project.ok.id,
        ...req.body,
        ...getTimestamps(),
        run_state: 'stopped',
        time_run_state_updated: new Date().toISOString(),
      }
      db.instances.push(newInstance)
      return res(json(newInstance, 201))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.DiskResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const disks = db.disks.filter((d) => d.project_id === project.ok.id)
      return res(json({ items: disks }))
    }
  ),

  rest.get<never, ProjectParams, Json<Api.VpcResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res, ctx) => {
      const project = lookupProject(req, res, ctx)
      if (project.err) return project.err
      const vpcs = db.vpcs.filter((v) => v.project_id === project.ok.id)
      return res(json({ items: vpcs }))
    }
  ),

  rest.get<never, VpcParams, Json<Api.Vpc> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      return res(json(vpc.ok))
    }
  ),

  rest.get<never, VpcParams, Json<Api.VpcSubnetResultsPage> | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err
      const items = db.vpcSubnets.filter((s) => s.vpc_id === vpc.ok.id)
      return res(json({ items }))
    }
  ),

  rest.post<
    Json<Api.VpcSubnetCreate>,
    VpcParams,
    Json<Api.VpcSubnet> | PostErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      const vpc = lookupVpc(req, res, ctx)
      if (vpc.err) return vpc.err

      const alreadyExists = db.vpcSubnets.some(
        (s) => s.vpc_id === vpc.ok.id && s.name === req.body.name
      )
      if (alreadyExists) return res(json(alreadyExistsErr, 400))

      const newSubnet: Json<Api.VpcSubnet> = {
        id: 'vpc-subnet-' + randomHex(),
        vpc_id: vpc.ok.id,
        ...req.body,
        ...getTimestamps(),
      }
      db.vpcSubnets.push(newSubnet)
      return res(json(newSubnet, 201))
    }
  ),
]
