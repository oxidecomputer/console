import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { handlers } from '@oxide/api-mocks'

export const server = setupServer(...handlers)

// Override request handlers in order to test special cases
export function overrideOnce(
  method: keyof typeof rest,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    rest[method](path, (_req, res, ctx) =>
      // https://mswjs.io/docs/api/response/once
      res.once(
        ctx.status(status),
        typeof body === 'string' ? ctx.text(body) : ctx.json(body)
      )
    )
  )
}
