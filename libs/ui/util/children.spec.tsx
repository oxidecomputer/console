import React from 'react'
import { isOneOf, pluckType } from './children'

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
