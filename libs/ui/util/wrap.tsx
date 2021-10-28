import React from 'react'
import type { ReactElement, ReactNode } from 'react'

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
