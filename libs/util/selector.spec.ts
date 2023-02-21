import { assertType } from 'vitest'

import { toApiSelector, toPathQuery } from './selector'

describe('toPathQuery', () => {
  it('works in the base case', () => {
    const result = toPathQuery('instance', {
      instance: 'i',
      project: 'p',
      organization: 'o',
    })
    expect(result).toEqual({
      path: { instance: 'i' },
      query: { project: 'p', organization: 'o' },
    })

    // with nice type inference
    assertType<{
      path: { instance: string }
      query: { project: string; organization: string }
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
    toPathQuery('instance', { instanc: 'i', project: 'p', organization: 'o' })
  })
})

describe('toApiSelector', () => {
  it('converts xName to x, handling orgName specially', () => {
    const result = toApiSelector({ orgName: 'abc', projectName: 'def' })
    expect(result).toEqual({ organization: 'abc', project: 'def' })

    // make sure it gets the type right
    assertType<{ organization: string; project: string }>(result)
  })

  it('type errors on keys that do not end in Name', () => {
    // @ts-expect-error keys must end in 'Name'
    toApiSelector({ projectNam: 'abc' })
  })
})
