/**
 * Even though this file doesn't contain JSX we've changed it to a TSX file to
 * avoid build failures with the `vite:react-babel` plugin.
 */
import cn from 'classnames'
import React, { type ComponentType } from 'react'

// all the cuteness of tw.span`text-green-500 uppercase` with zero magic

const make =
  <T extends keyof JSX.IntrinsicElements>(tag: T) =>
  // only one argument here means string interpolations are not allowed
  (strings: TemplateStringsArray) => {
    const Comp = ({ className, children, ...rest }: JSX.IntrinsicElements[T]) =>
      React.createElement(tag, { className: cn(strings[0], className), ...rest }, children)
    Comp.displayName = `classed.${tag}`
    return Comp
  }

// JSX.IntrinsicElements[T] ensures same props as the real DOM element. For example,
// classed.span doesn't allow a type attr but classed.input does.

export const classed = {
  button: make('button'),
  div: make('div'),
  footer: make('footer'),
  h1: make('h1'),
  h2: make('h2'),
  h3: make('h3'),
  h4: make('h4'),
  hr: make('hr'),
  header: make('header'),
  input: make('input'),
  label: make('label'),
  li: make('li'),
  main: make('main'),
  ol: make('ol'),
  p: make('p'),
  span: make('span'),
  table: make('table'),
  tbody: make('tbody'),
  td: make('td'),
  th: make('th'),
  tr: make('tr'),
  /** Inject classes into a component that already takes a `className`. */
  inject,
} as const

function inject<P extends { className?: string }>(
  Comp: ComponentType<P>,
  className: string
) {
  const NewComp = function (props: P) {
    return <Comp {...props} className={cn(className, props.className)} />
  }
  NewComp.displayName = 'Classed' + (Comp.displayName || '')
  return NewComp
}

// result: classed.button`text-green-500 uppercase` returns a component with those classes
