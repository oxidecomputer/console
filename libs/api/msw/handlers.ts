import { rest } from 'msw'
import {
  disks,
  instance,
  instances,
  projects,
  orgs,
  org,
  sessionMe,
  vpcs,
} from '@oxide/api-mocks'

export const handlers = [
  rest.get('/api/session/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(sessionMe))
  }),

  rest.get('/api/organizations', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(orgs))
  }),

  rest.post('/api/organizations', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(org))
  }),

  rest.get('/api/organizations/:orgId', (req, res, ctx) => {
    return res(ctx.status(404), ctx.text('Not found'))
  }),

  rest.get('/api/organizations/:orgId/projects', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projects))
  }),

  rest.get(
    '/api/organizations/:orgId/projects/:projectId/instances',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(instances))
    }
  ),

  rest.post(
    '/api/organizations/:orgId/projects/:projectId/instances',
    (req, res, ctx) => {
      return res(ctx.status(201), ctx.json(instance))
    }
  ),

  rest.get(
    '/api/organizations/:orgId/projects/:projectId/disks',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(disks))
    }
  ),

  rest.get(
    '/api/organizations/:orgId/projects/:projectId/vpcs',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(vpcs))
    }
  ),
]
