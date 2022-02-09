import type {
  DefaultRequestBody,
  PathParams,
  ResponseComposition,
  ResponseFunction,
  RestContext,
  RestRequest,
} from 'msw'
import type { Json } from '../json-type'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'

export const notFoundErr = { error_code: 'ObjectNotFound' } as const

type Result<T> =
  | { ok: T; err: null }
  | { ok: null; err: ReturnType<ResponseFunction> }

export type OrgParams = { orgName: string }
export type ProjectParams = { orgName: string; projectName: string }
export type VpcParams = {
  orgName: string
  projectName: string
  vpcName: string
}
export type InstanceParams = {
  orgName: string
  projectName: string
  instanceName: string
}
export type VpcSubnetParams = {
  orgName: string
  projectName: string
  vpcName: string
  subnetName: string
}

// lets us make sure you're only calling a lookup function from a handler with
// the required path params
type Req<P extends PathParams> = RestRequest<DefaultRequestBody, P>

export function lookupOrg(
  req: Req<OrgParams>,
  res: ResponseComposition,
  ctx: RestContext
): Result<Json<Api.Organization>> {
  const org = db.orgs.find((o) => o.name === req.params.orgName)
  if (!org) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }
  return { ok: org, err: null }
}

export function lookupProject(
  req: Req<ProjectParams>,
  res: ResponseComposition,
  ctx: RestContext
): Result<Json<Api.Project>> {
  const org = lookupOrg(req, res, ctx)
  if (org.err) return org // has to be the whole result, not just the error

  const project = db.projects.find(
    (p) => p.organization_id === org.ok.id && p.name === req.params.projectName
  )
  if (!project) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: project, err: null }
}

export function lookupVpc(
  req: Req<VpcParams>,
  res: ResponseComposition,
  ctx: RestContext
): Result<Json<Api.Vpc>> {
  const project = lookupProject(req, res, ctx)
  if (project.err) return project // has to be the whole result, not just the error

  const vpc = db.vpcs.find(
    (p) => p.project_id === project.ok.id && p.name === req.params.vpcName
  )
  if (!vpc) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: vpc, err: null }
}

export function lookupInstance(
  req: Req<InstanceParams>,
  res: ResponseComposition,
  ctx: RestContext
): Result<Json<Api.Instance>> {
  const project = lookupProject(req, res, ctx)
  if (project.err) return project // has to be the whole result, not just the error

  const instance = db.instances.find(
    (p) => p.project_id === project.ok.id && p.name === req.params.instanceName
  )
  if (!instance) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: instance, err: null }
}

export function lookupVpcSubnet(
  req: Req<VpcSubnetParams>,
  res: ResponseComposition,
  ctx: RestContext
): Result<Json<Api.VpcSubnet>> {
  const vpc = lookupVpc(req, res, ctx)
  if (vpc.err) return vpc // has to be the whole result, not just the error

  const subnet = db.vpcSubnets.find(
    (p) => p.vpc_id === vpc.ok.id && p.name === req.params.subnetName
  )
  if (!subnet) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: subnet, err: null }
}

const initDb = {
  orgs: [mock.org],
  projects: [mock.project],
  instances: [mock.instance],
  disks: [mock.disk],
  vpcs: [mock.vpc],
  vpcSubnets: [mock.vpcSubnet],
  vpcFirewallRules: [...mock.defaultFirewallRules],
}

const clone = (o: unknown) => JSON.parse(JSON.stringify(o))

export function resetDb() {
  db = clone(initDb)
}

export let db: typeof initDb = clone(initDb)
