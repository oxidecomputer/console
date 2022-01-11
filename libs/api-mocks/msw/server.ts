import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

const server = setupServer(...handlers)

// Override request handlers in order to test special cases
function override(
  method: keyof typeof rest,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    rest[method](path, (_req, res, ctx) => {
      return res(
        ctx.status(status),
        typeof body === 'string' ? ctx.text(body) : ctx.json(body)
      )
    })
  )
}

export { server, rest, override }
