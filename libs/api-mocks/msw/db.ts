import type {
  ResponseComposition,
  ResponseFunction,
  RestContext,
  RestRequest,
} from 'msw'

import * as mock from '@oxide/api-mocks'
import type { ApiTypes as Api } from '@oxide/api'

export const notFoundErr = { error_code: 'ObjectNotFound' }

type Result<T> =
  | { ok: T; err: null }
  | { ok: null; err: ReturnType<ResponseFunction> }

type Lookup<T> = (
  req: RestRequest,
  res: ResponseComposition,
  ctx: RestContext
) => Result<T>

export const lookupOrg: Lookup<Api.Organization> = (req, res, ctx) => {
  const org = db.orgs.find((o) => o.name === req.params.orgName)
  if (!org) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }
  return { ok: org, err: null }
}

export const lookupProject: Lookup<Api.Project> = (req, res, ctx) => {
  const org = lookupOrg(req, res, ctx)
  if (org.err) return org // has to be the whole result, not just the error

  const project = db.projects.find(
    (p) => p.organizationId === org.ok.id && p.name === req.params.projectName
  )
  if (!project) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: project, err: null }
}

export const lookupVpc: Lookup<Api.Vpc> = (req, res, ctx) => {
  const project = lookupProject(req, res, ctx)
  if (project.err) return project // has to be the whole result, not just the error

  const vpc = db.vpcs.find(
    (p) => p.projectId === project.ok.id && p.name === req.params.vpcName
  )
  if (!vpc) {
    return { ok: null, err: res(ctx.status(404), ctx.json(notFoundErr)) }
  }

  return { ok: vpc, err: null }
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

export let db: typeof initDb = clone(initDb)
