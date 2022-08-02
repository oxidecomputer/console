import type { ResponseTransformer } from 'msw'
import { compose, context } from 'msw'

/**
 * Custom transformer: convenience function for less typing. Equivalent to
 * `res(ctx.status(status), ctx.json(body))` in a handler.
 *
 * https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export const json = <B>(body: B, status = 200, delay = 0): ResponseTransformer<B> =>
  compose(context.status(status), context.json(body), context.delay(delay))

export interface ResultsPage<I extends { id: string }> {
  items: I[]
  nextPage: string | null
}

export const paginated = <I extends { id: string }>(
  urlParams: string,
  items: I[]
): ResultsPage<I> => {
  const params = new URLSearchParams(urlParams)
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

  if (limit + startIndex >= items.length) {
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

// handy for testing
export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

// make a bunch of copies of an object with different names and IDs. useful for
// testing pagination
export const repeat = <T extends { id: string; name: string }>(obj: T, n: number): T[] =>
  new Array(n).fill(0).map((_, i) => ({ ...obj, id: obj.id + i, name: obj.name + i }))
