/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import React, { type ComponentType, type ReactElement, type ReactNode } from 'react'

type ReactChildren = typeof React.Children

type ChildArray = ReturnType<ReactChildren['toArray']>
type ChildSelector = Parameters<ChildArray['findIndex']>[0]

/**
 * Collapses down children that are nested inside of a fragment
 */
export const flattenChildren = (children: ReactNode): ChildArray => {
  const childArray = React.Children.toArray(children)
  return childArray.reduce((flattened: ChildArray, child) => {
    if ((child as ReactElement)?.type === React.Fragment) {
      // in React 18, ReactElement defaulted to any, now we have to say it (embarrassingly)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return flattened.concat(flattenChildren((child as ReactElement<any>).props.children))
    }
    flattened.push(child)
    return flattened
  }, [])
}

const matchType = <P,>(child: ReactElement, componentType: ComponentType<P>) => {
  if (!child?.type) return false
  // This exists because during react fast-refresh the component types
  // are swizzled out for a new reference. So the component imported from a module
  // and the type in a component reference will _always_ be false after said component
  // is fast refreshed. We'll test the displayName if our target type has one otherwise
  // we have to fallback on some very imperfect string comparisons.
  if (process.env.NODE_ENV !== 'production' && typeof child.type !== 'string') {
    if (componentType.displayName) {
      return (child.type as ComponentType).displayName === componentType.displayName
    }
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

const pluck = <P,>(
  children: ChildArray,
  selector: ChildSelector
): React.ReactElement<P, ComponentType<P>> | null => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1
    ? (children.splice(childIndex, 1)[0] as React.ReactElement<P, ComponentType<P>>)
    : null
}

export const pluckFirstOfType = <P,>(
  children: ChildArray,
  componentType: ComponentType<P>
) => pluck<P>(children, (child) => matchType(child as ReactElement, componentType))

export const pluckAllOfType = <P,>(
  children: ChildArray,
  componentType: ComponentType<P>
) => {
  const result: React.ReactElement<P, ComponentType<P>>[] = []
  for (let i = children.length - 1; i >= 0; --i) {
    if (matchType(children[i] as ReactElement, componentType)) {
      result.unshift(children.splice(i, 1)[0] as React.ReactElement<P, ComponentType<P>>)
    }
  }
  return result
}
