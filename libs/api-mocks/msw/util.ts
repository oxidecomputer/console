import type { ResponseTransformer, RestRequest } from 'msw'
import { context, compose } from 'msw'

/**
 * Custom transformer: convenience function for less typing. Equivalent to
 * `res(ctx.status(status), ctx.json(body))` in a handler.
 *
 * https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export const json = <B>(body: B, status = 200): ResponseTransformer<B> =>
  compose(context.status(status), context.json(body))

export interface ResultsPage<I extends { id: string }> {
  items: I[]
  nextPage: string | null
}

export const paginated = <I extends { id: string }>(
  req: RestRequest<any, any>,
  items: I[]
): ResultsPage<I> => {
  const params = new URLSearchParams(req.url.search)
  const limit = parseInt(params.get('limit') || '10', 10)
  let startIndex = params.get('page_token')
    ? items.findIndex((i) => i.id === params.get('page_token'))
    : 0
  startIndex = startIndex < 0 ? 0 : startIndex

  if (startIndex > items.length) {
    return {
      items: [],
      nextPage: null,
    }
  }

  if (limit + startIndex > items.length) {
    return {
      items: items.slice(startIndex),
      nextPage: null,
    }
  }

  return {
    items: items.slice(startIndex, startIndex + limit),
    nextPage: `${items[startIndex + limit].id}`,
  }
}
