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

  rest.get('/api/organizations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mock.orgs))
  }),

  rest.post('/api/organizations', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mock.org))
  }),

  rest.get('/api/organizations/:orgName', (req, res, ctx) => {
    return res(ctx.status(404), ctx.text('Not found'))
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
    const { orgName } = req.params
    // this isn't fully correct yet — it should also check the project ID
    // on the vpc and the org ID on the project. ugh
    const org = db.orgs.find((org) => org.name === orgName)
    if (!org) {
      return res(ctx.status(404), ctx.json(notFoundErr))
    }

    const { name, description } = req.body

    const alreadyExists =
      db.projects.filter((p) => p.organizationId === org.id && p.name === name)
        .length > 0

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
    return res(ctx.status(201), ctx.json(newProject))
  }),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mock.project))
    }
  ),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mock.instances))
    }
  ),

  rest.post(
    '/api/organizations/:orgName/projects/:projectName/instances',
    (req, res, ctx) => {
      return res(ctx.status(201), ctx.json(mock.instance))
    }
  ),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName/disks',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mock.disks))
    }
  ),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName/vpcs',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ items: db.vpcs }))
    }
  ),

  rest.get<NoBody, ToRecord<Api.ProjectVpcsGetVpcParams>, Api.Vpc | GetErr>(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      const result = db.vpcs.find((vpc) => vpc.name === req.params.vpcName)
      if (!result) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      return res(ctx.status(200), ctx.json(result))
    }
  ),

  rest.get<
    NoBody,
    ToRecord<Api.VpcSubnetsGetParams>,
    Api.VpcSubnetResultsPage | GetErr
  >(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      // need to know:
      // - name of this table (vpcSubnets)
      // - name of param identifying parent (vpcName)
      // - name of parent table (vpcs)
      // - name of parent id field (vpc_id)

      const { vpcName } = req.params
      const vpc = db.vpcs.find((vpc) => vpc.name === vpcName)
      if (!vpc) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }
      const items = db.vpcSubnets.filter((s) => s.vpc_id === vpc.id)
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
      // need to know:
      // - name of this table (vpcSubnets)
      // - name of param identifying parent (vpcName)
      // - name of parent table (vpcs)
      // - name of parent id field (vpc_id)
      // - how to convert req.body into params

      const { name, description, ipv4Block, ipv6Block } = req.body

      const { vpcName } = req.params
      // this isn't fully correct yet — it should also check the project ID
      // on the vpc and the org ID on the project. ugh
      const vpc = db.vpcs.find((vpc) => vpc.name === vpcName)
      if (!vpc) {
        return res(ctx.status(404), ctx.json(notFoundErr))
      }

      const alreadyExists =
        db.vpcSubnets.filter((o) => o.vpc_id === vpc.id && o.name === name)
          .length > 0

      if (alreadyExists) {
        return res(ctx.status(400), ctx.json(alreadyExistsErr))
      }

      const newSubnet = {
        id: 'vpc-subnet-' + crypto.randomUUID(),
        vpc_id: vpc.id,
        ...getTimestamps(),
        name,
        dnsName: name,
        description,
        ipv4_block: ipv4Block,
        ipv6_block: ipv6Block,
      }
      db.vpcSubnets.push(newSubnet)
      return res(ctx.status(201), ctx.json(newSubnet))
    }
  ),
]
