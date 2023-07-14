import { describe, expect, it } from 'vitest'

import { flattenChildren, isOneOf, pluckAllOfType, pluckFirstOfType } from './children'

const TestA = () => (
  <div>
    <span>Test A </span>
  </div>
)
const TestB = () => (
  <div>
    <span>Test B </span>
  </div>
)

describe('flattenChildren', () => {
  it('should not alter children without fragments', () => {
    // A fake representation of what would return from component.props.children
    const children = (
      <div>
        <TestA />
        <TestB />
      </div>
    )
    const flattened = flattenChildren(children)
    expect(flattened).toMatchInlineSnapshot(`
      [
        <div>
          <TestA />
          <TestB />
        </div>,
      ]
    `)
  })

  it('should unwrap children from fragments', () => {
    const children = (
      <>
        <TestA />
        <TestB />
      </>
    )
    const flattened = flattenChildren(children)
    expect(flattened).toMatchInlineSnapshot(`
      [
        <TestA />,
        <TestB />,
      ]
    `)
  })
  it('should unwrap children deeply nested in fragments', () => {
    const children = (
      <>
        <>
          <TestA />
          <TestB />
        </>
        <>{'hello'}</>
      </>
    )
    const flattened = flattenChildren(children)
    expect(flattened).toMatchInlineSnapshot(`
      [
        <TestA />,
        <TestB />,
        "hello",
      ]
    `)
  })
})

describe('pluckFirstOfType', () => {
  it('Should remove a component of a given type from its children', () => {
    const testA = <TestA />
    const testB = <TestB />
    const childArray = [testA, testB, 'hello']
    const plucked = pluckFirstOfType(childArray, TestA)
    expect(plucked).toEqual(testA)
    expect(childArray).toEqual([testB, 'hello'])
  })

  it('Should not fail when children empty', () => {
    const childArray: JSX.Element[] = []
    const plucked = pluckFirstOfType(childArray, TestA)
    expect(plucked).toEqual(null)
    expect(childArray).toEqual([])
  })
})

describe('pluckAllOfType', () => {
  it('should return and remove all components of a given set of children', () => {
    const testA = <TestA />
    const testB = <TestB />
    const childArray = [testA, testB, testA, 'hello']
    const plucked = pluckAllOfType(childArray, TestA)
    expect(plucked).toEqual([testA, testA])
    expect(childArray).toEqual([testB, 'hello'])
  })

  it('should return empty array when there are no matches', () => {
    const testA = <TestA />
    const childArray = [testA, 'test', testA, 'hello']
    const plucked = pluckAllOfType(childArray, TestB)
    expect(plucked).toEqual([])
    expect(childArray).toEqual([testA, 'test', testA, 'hello'])
  })

  it('should not fail when children is empty', () => {
    const childArray: JSX.Element[] = []
    const plucked = pluckAllOfType(childArray, TestA)
    expect(plucked).toEqual([])
    expect(childArray).toEqual([])
  })
})

describe('isOneOf', () => {
  it('Should return true if all children specified', () => {
    const testA = <TestA />
    const testB = <TestB />
    const childArray = [testA, testB]
    expect(isOneOf(childArray, [TestA, TestB])).toBe(true)
  })

  it('Should return false if unexpected child passed', () => {
    const testA = <TestA />
    const testB = <TestB />
    const childArray = [testA, testB, 'uh-oh']
    expect(isOneOf(childArray, [TestA, TestB])).toBe(false)
  })
})
