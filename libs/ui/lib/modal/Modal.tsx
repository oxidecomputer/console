import React, { useEffect, useRef } from 'react'

import type { IconName } from '../icon/icons'
import { Icon } from '../icon/Icon'
import { Button } from '../button/Button'
import { classed } from '../../util/classed'

interface ActionProps {
  primary?: boolean
  onClick: () => void
  children: React.ReactNode
}

const ActionButton = ({ primary, children, onClick }: ActionProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (primary) buttonRef.current?.focus()
  }, [primary])

  const variant = primary ? 'solid' : 'dim'
  return (
    <Button
      className="flex-1"
      variant={variant}
      onClick={onClick}
      ref={buttonRef}
    >
      {children}
    </Button>
  )
}

const Container = classed.div`
  flex flex-col w-full bg-black
  sm:self-center sm:mx-auto sm:w-[50vw]
`

const Body = classed.div`p-6 space-y-4 flex-1`

const IconWrapper = (props: { icon: IconName }) => (
  <div className="w-12 h-12 bg-green-900 rounded-full">
    <Icon className="w-12 text-green-500" name={props.icon} />
  </div>
)

export type AlertModalProps = {
  title: string
  icon?: IconName
  children: React.ReactNode

  confirmText: string
  onConfirm: () => void
}

export const AlertModal = (props: AlertModalProps) => (
  <Container className="lg:w-1/4">
    <Body>
      {props.icon && <IconWrapper icon={props.icon} />}
      <header className="text-green-500">{props.title}</header>
      <p className="text-sm">{props.children}</p>
    </Body>
    <footer className="flex">
      <ActionButton primary onClick={props.onConfirm}>
        {props.confirmText}
      </ActionButton>
    </footer>
  </Container>
)

export type ConfirmModalProps = AlertModalProps & {
  cancelText: string
  onCancel: () => void
}

export const ConfirmModal = (props: ConfirmModalProps) => (
  <Container className="lg:w-1/3">
    <Body>
      {props.icon && <IconWrapper icon={props.icon} />}
      <header className="text-green-500">{props.title}</header>
      <p className="text-sm">{props.children}</p>
    </Body>
    <footer className="flex">
      <ActionButton onClick={props.onCancel}>{props.cancelText}</ActionButton>
      <ActionButton primary onClick={props.onConfirm}>
        {props.confirmText}
      </ActionButton>
    </footer>
  </Container>
)
