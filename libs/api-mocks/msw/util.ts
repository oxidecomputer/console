import type { ResponseTransformer } from 'msw'
import { context, compose } from 'msw'

/**
 * Custom transformer: convenience function for less typing. Equivalent to
 * `res(ctx.status(status), ctx.json(body))` in a handler.
 *
 * https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export const json = <B>(body: B, status = 200): ResponseTransformer<B> =>
  compose(context.status(status), context.json(body))
