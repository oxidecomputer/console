import { isValid, parseISO, subHours } from 'date-fns'
import type { ResponseTransformer } from 'msw'
import { compose, context } from 'msw'

/**
 * Custom transformer: convenience function for setting response `status` and/or
 * `delay`.
 *
 * @see https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export function json<B>(
  body: B,
  options: { status?: number; delay?: number } = {}
): ResponseTransformer<B> {
  const { status = 200, delay = 0 } = options
  return compose(context.status(status), context.json(body), context.delay(delay))
}

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

// make a bunch of copies of an object with different names and IDs. useful for
// testing pagination
export const repeat = <T extends { id: string; name: string }>(obj: T, n: number): T[] =>
  new Array(n).fill(0).map((_, i) => ({ ...obj, id: obj.id + i, name: obj.name + i }))

export const clone = <T extends object>(obj: T): T =>
  typeof structuredClone !== 'undefined'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj))

function getDateParam(params: URLSearchParams, key: string): Date | null {
  const value = params.get(key)
  if (!value) return null

  const date = parseISO(value)
  if (!isValid(date)) return null

  return date
}

export function getStartAndEndTime(searchParams: URLSearchParams) {
  const queryStartTime = getDateParam(searchParams, 'start_time')
  const queryEndTime = getDateParam(searchParams, 'end_time')

  // if no start time or end time, give the last 24 hours. in this case the
  // API will give all data available for the metric (paginated of course),
  // so essentially we're pretending the last 24 hours just happens to be
  // all the data. if we have an end time but no start time, same deal, pretend
  // 24 hours before the given end time is where it starts
  const now = new Date()
  const endTime = queryEndTime || now
  const startTime = queryStartTime || subHours(endTime, 24)

  return { startTime, endTime }
}
