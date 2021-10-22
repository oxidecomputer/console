import React from 'react'
import type {
  ComponentType,
  ReactChildren,
  ReactElement,
  ReactNode,
} from 'react'

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

interface WrapProps<C extends ReactNode> {
  when: unknown
  with: ReactElement
  children: C
}

export const Wrap = <C extends ReactNode>(props: WrapProps<C>) =>
  props.when ? (
    React.cloneElement(props.with, [], props.children)
  ) : (
    <>{props.children}</>
  )
