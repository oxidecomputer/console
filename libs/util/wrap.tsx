import React from 'react'
import type { ReactElement, ReactNode } from 'react'

interface WrapProps {
  when: unknown
  with: ReactElement
  children: ReactNode
}

export const Wrap = (props: WrapProps) =>
  props.when ? (
    React.cloneElement(props.with, [], props.children)
  ) : (
    <>{props.children}</>
  )
