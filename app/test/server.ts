import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { handlers, json } from '@oxide/api-mocks'

export const server = setupServer(...handlers)

// Override request handlers in order to test special cases
export function override(
  method: keyof typeof rest,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    rest[method](path, (_req, res, ctx) =>
      typeof body === 'string'
        ? res(ctx.status(status), ctx.text(body))
        : res(json(body, status))
    )
  )
}
