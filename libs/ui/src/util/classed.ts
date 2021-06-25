import React from 'react'
import cn from 'classnames'

// all the cuteness of tw.span`text-green-500 uppercase` with zero magic

const make =
  <T extends keyof JSX.IntrinsicElements>(tag: T) =>
  // only one argument here means string interpolations are not allowed
  (strings: TemplateStringsArray) =>
  ({ className, children, ...rest }: JSX.IntrinsicElements[T]) =>
    React.createElement(
      tag,
      { className: cn(strings[0], className), ...rest },
      children
    )

// JSX.IntrinsicElements[T] ensures same props as the real DOM element. For example,
// classed.span doesn't allow a type attr but classed.input does.

export const classed = {
  button: make('button'),
  div: make('div'),
  header: make('header'),
  input: make('input'),
  li: make('li'),
  ol: make('ol'),
  p: make('p'),
  span: make('span'),
} as const

// result: classed.button`text-green-500 uppercase` returns a component with those classes
