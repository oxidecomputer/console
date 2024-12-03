/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { ReactElement, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { classed } from '~/util/classed'

import { Button, buttonStyle } from './Button'

const buttonStyleProps = { variant: 'ghost', size: 'sm', color: 'secondary' } as const

type Props = {
  icon?: ReactElement
  title: string
  body?: ReactNode
} & ( // only require buttonTo or onClick if buttonText is present
  | { buttonText: string; buttonTo: string }
  | { buttonText: string; onClick: () => void }
  | { buttonText?: never }
)

export function EmptyMessage(props: Props) {
  let button: ReactElement | null = null
  if (props.buttonText && 'buttonTo' in props) {
    button = (
      <Link className={cn('mt-6', buttonStyle(buttonStyleProps))} to={props.buttonTo}>
        {props.buttonText}
      </Link>
    )
  } else if (props.buttonText && 'onClick' in props) {
    button = (
      <Button {...buttonStyleProps} className="mt-6" onClick={props.onClick}>
        {props.buttonText}
      </Button>
    )
  }
  return (
    <div className="m-4 flex max-w-[18rem] flex-col items-center text-center">
      {props.icon && (
        <div className="mb-4 rounded p-1 leading-[0] text-accent bg-accent-secondary">
          {props.icon}
        </div>
      )}
      <h3 className="text-sans-semi-lg">{props.title}</h3>
      {typeof props.body === 'string' ? <EMBody>{props.body}</EMBody> : props.body}
      {button}
    </div>
  )
}

export const EMBody = classed.p`mt-1 text-balance text-sans-md text-default`
