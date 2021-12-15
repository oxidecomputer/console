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
 * A helper intended to be provided to a map call on an array of elements to iterate
 * each and provide it with a key
 *
 * @example
 *
 * [<div/>, <div/>, <div/>].map(addKey(i => `div-${i}`))
 */
export const addKey =
  (makeKey: (i: number) => string) =>
  (child: Component | ReactElement, index: number): ReactElement =>
    React.cloneElement(child as ReactElement, { key: makeKey(index) })

// TODO: Make generic / add better types
export const addProps =
  (makeProps: (i: number, props: object) => object) =>
  (child: Component | ReactElement, index: number): ReactElement =>
    React.cloneElement(child as ReactElement, {
      ...makeProps(index, child?.props),
    })

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

const matchType = <P extends unknown>(
  child: ReactElement,
  componentType: ComponentType<P>
) => {
  if (!child?.type) return false
  // This exists because during react fast-refresh the component types
  // are swizzled out for a new reference. So the component imported from a module
  // and the type in a component reference will _always_ be false after said component
  // is fast refreshed. We're just relying on stringifying the function body contents
  // here instead.
  if (process.env.NODE_ENV !== 'production') {
    return child.type.toString() === componentType.toString()
  }
  return child.type === componentType
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
    components.some((type) => matchType(child as ReactElement, type))
  return React.Children.toArray(children).every(childIsOneOf)
}

export const pluck = <P extends unknown>(
  children: ChildArray,
  selector: ChildSelector
) => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1
    ? (children.splice(childIndex, 1)[0] as Component<P>)
    : null
}

export const pluckFirstOfType = <P extends unknown>(
  children: ChildArray,
  componentType: ComponentType<P>
) =>
  pluck<P>(children, (child) => matchType(child as ReactElement, componentType))

export const pluckAllOfType = <P extends unknown>(
  children: ChildArray,
  componentType: ComponentType<P>
) => {
  const result: Component<P>[] = []
  for (let i = children.length - 1; i >= 0; --i) {
    if (matchType(children[i] as ReactElement, componentType)) {
      result.unshift(children.splice(i, 1)[0] as Component<P>)
    }
  }
  return result
}
