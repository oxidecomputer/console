import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

const server = setupServer(...handlers)

function override(
  method: keyof typeof rest,
  path: string,
  status: number,
  body: string | Record<string, unknown>
) {
  server.use(
    rest[method](path, (req, res, ctx) =>
      res(
        ctx.status(status),
        typeof body === 'string' ? ctx.text(body) : ctx.json(body)
      )
    )
  )
}

export { server, rest, override }
