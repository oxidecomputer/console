import { assertType } from 'vitest'

import { toPathQuery } from './selector'

describe('toPathQuery', () => {
  it('works in the base case', () => {
    const result = toPathQuery('instance', {
      instance: 'i',
      project: 'p',
    })
    expect(result).toEqual({
      path: { instance: 'i' },
      query: { project: 'p' },
    })

    // with nice type inference
    assertType<{
      path: { instance: string }
      query: { project: string }
    }>(result)
  })

  it('leaves an empty query in there when there is only the one key', () => {
    expect(toPathQuery('instance', { instance: 'i' })).toEqual({
      path: { instance: 'i' },
      query: {},
    })
  })

  it('type errors on missing key', () => {
    // type error if key is not in the object
    // @ts-expect-error
    toPathQuery('instance', { instanc: 'i', project: 'p' })
  })
})
