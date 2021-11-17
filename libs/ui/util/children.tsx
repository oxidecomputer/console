import type {
  Component,
  ComponentType,
  ReactChildren,
  ReactElement,
  ReactNode,
} from 'react'
import React from 'react'

export type ChildrenProp = { children?: ReactNode }
type ChildArray = ReturnType<ReactChildren['toArray']>
type ChildSelector = Parameters<ChildArray['findIndex']>[0]

/**
 * Collapses down children that are nested inside of a fragment
 */
export const flattenChildren = (children: ReactNode): ChildArray => {
  const childArray = React.Children.toArray(children)
  return childArray.reduce((flattened: ChildArray, child) => {
    if ((child as ReactElement)?.type === React.Fragment) {
      return flattened.concat(
        flattenChildren((child as ReactElement).props.children)
      )
    }
    flattened.push(child)
    return flattened
  }, [])
}

/**
 * A function to be used with invariant to ensure at dev runtime that only expected
 * children are passed to a given component.
 */
export const isOneOf = (
  children: ReactNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: ComponentType<any>[]
) => {
  const childIsOneOf = (child: ReactNode) =>
    components.includes((child as ReactElement)?.type as ComponentType)
  return React.Children.toArray(children).every(childIsOneOf)
}

export const pluck = <P,>(children: ChildArray, selector: ChildSelector) => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1
    ? (children.splice(childIndex, 1)[0] as Component<P>)
    : null
}

export const pluckFirstOfType = <P,>(
  children: ChildArray,
  componentType: ComponentType<P>
) =>
  pluck<P>(children, (child) => (child as ReactElement)?.type === componentType)

export const pluckAllOfType = <P,>(
  children: ChildArray,
  componentType: ComponentType<P>
) => {
  const result: Component<P>[] = []
  for (let i = children.length - 1; i >= 0; --i) {
    if ((children[i] as ReactElement)?.type === componentType) {
      result.unshift(children.splice(i, 1)[0] as Component<P>)
    }
  }
  return result
}
