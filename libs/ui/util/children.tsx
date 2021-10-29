import type {
  ComponentType,
  ReactChild,
  ReactChildren,
  ReactElement,
  ReactNode,
} from 'react'
import React from 'react'

export type ChildrenProp = { children?: ReactNode }
type ChildArray = ReturnType<ReactChildren['toArray']>
type ChildSelector = Parameters<ChildArray['findIndex']>[0]

export const pluck = (
  children: ChildArray,
  selector: ChildSelector
): ChildArray[number] | null => {
  const childIndex = children.findIndex(selector)
  return childIndex !== -1 ? children.splice(childIndex, 1)[0] : null
}

export const pluckType = <P extends Record<string, unknown>>(
  children: ChildArray,
  componentType: ComponentType<P>
) => pluck(children, (child) => (child as ReactElement)?.type === componentType)

/**
 * A function to be used with invariant to ensure at dev runtime that only expected
 * children are passed to a given component.
 */
export const isOneOf = (
  children: ReactNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: ComponentType<any>[]
) =>
  !React.Children.map(
    children,
    (child) =>
      child &&
      components.includes((child as ReactElement)?.type as ComponentType)
  )?.some((typeMatch) => !typeMatch)
