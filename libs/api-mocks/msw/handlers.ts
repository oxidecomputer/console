import { rest } from 'msw'
import * as mock from '@oxide/api-mocks'

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

  rest.get('/api/organizations/:orgName/projects', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mock.projects))
  }),

  rest.post('/api/organizations/:orgName/projects', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mock.project))
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
      return res(ctx.status(200), ctx.json(mock.vpcs))
    }
  ),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mock.vpc))
    }
  ),

  rest.get(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mock.vpcSubnets))
    }
  ),

  rest.post(
    '/api/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
    (req, res, ctx) => {
      return res(ctx.status(201), ctx.json(mock.vpcSubnet2))
    }
  ),
]
