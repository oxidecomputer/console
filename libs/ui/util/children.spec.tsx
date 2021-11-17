import React from 'react'
import { flattenChildren, isOneOf, pluckAllOfType, pluckType } from './children'

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
    const input = (
      <div id="wrapper">
        <TestA />
        <TestB />
      </div>
    )
    const flattened = flattenChildren(input)
    const childArray = React.Children.toArray(input)
    expect(flattened).toEqual(childArray)
  })

  it('should unwrap children from fragments', () => {
    const input = (
      <>
        <TestA />
        <TestB />
      </>
    )
    const flattened = flattenChildren(input)
    const childArray = React.Children.toArray(input.props.children)
    expect(flattened).toEqual(childArray)
  })
})

it('should fail to match an element wrapped in a fragment', () => {
  const input = (
    <>
      <TestA />
      <TestB />
    </>
  )
  const flattened = flattenChildren(input)
  const childArray = React.Children.toArray(input)
  expect(flattened).not.toEqual(childArray)
})
describe('pluckType', () => {
  it('Should remove a component of a given type from its children', () => {
    const testA = <TestA />
    const testB = <TestB />
    const childArray = [testA, testB, 'hello']
    const plucked = pluckType(childArray, TestA)
    expect(plucked).toEqual(testA)
    expect(childArray).toEqual([testB, 'hello'])
  })

  it('Should not fail when children empty', () => {
    const childArray: JSX.Element[] = []
    const plucked = pluckType(childArray, TestA)
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
