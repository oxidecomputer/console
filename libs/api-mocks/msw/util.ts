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

export interface ResultsPage<I> {
  items: I[]
  nextPage: string | null
}

export const paginated = <I>(req: RestRequest<any, any>, items: I[]): ResultsPage<I> => {
  const params = new URLSearchParams(req.url.search)
  const limit = parseInt(params.get('limit') || '10', 10)
  const pageToken = parseInt(params.get('page_token') || '0', 10)

  console.log('limit', limit)

  if (pageToken > items.length) {
    return {
      items: [],
      nextPage: null,
    }
  }

  if (limit + pageToken > items.length) {
    return {
      items: items.slice(pageToken),
      nextPage: null,
    }
  }

  return {
    items: items.slice(pageToken, pageToken + limit),
    nextPage: `${pageToken + limit}`,
  }
}
