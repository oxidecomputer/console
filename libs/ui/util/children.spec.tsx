import React from 'react'
import { render } from '@testing-library/react'
import { pluckType } from './children'
import type { ChildrenProp } from './children'

const TestA = ({ children }: ChildrenProp) => (
  <div>
    <span>Test A </span>
    {children}
  </div>
)
const TestB = ({ children }: ChildrenProp) => (
  <div>
    <span>Test B </span>
    {children}
  </div>
)
describe('pluckType', () => {
  it('Should remove a component of a given type from its children', () => {
    const PluckRemove = ({ children }: ChildrenProp) => {
      const childArray = React.Children.toArray(children)
      const testA = pluckType(childArray, TestA)
      // @ts-expect-error
      expect(testA.type).toBe(TestA)
      return <>{childArray}</>
    }
    const { queryByText } = render(
      <PluckRemove>
        <TestA />
        <TestB />
        hello
      </PluckRemove>
    )
    expect(queryByText('Test A')).not.toBeInTheDocument()
    expect(queryByText('Test B')).toBeInTheDocument()
    expect(queryByText('hello')).toBeInTheDocument()
  })

  it('Should not remove a nested child', () => {
    const PluckKeep = ({ children }: ChildrenProp) => {
      const childArray = React.Children.toArray(children)
      pluckType(childArray, TestB)
      return <>{childArray}</>
    }
    const { queryByText } = render(
      <PluckKeep>
        <TestA>
          <TestB />
        </TestA>
      </PluckKeep>
    )
    expect(queryByText('Test A')).toBeInTheDocument()
    expect(queryByText('Test B')).toBeInTheDocument()
  })

  it('Should not fail when children empty', () => {
    const PluckKeep = ({ children }: ChildrenProp) => {
      const childArray = React.Children.toArray(children)
      pluckType(childArray, TestB)
      return <>{childArray}</>
    }
    expect(() => render(<PluckKeep />)).not.toThrowError()
  })
})
