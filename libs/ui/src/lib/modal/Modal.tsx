import React, { useEffect, useRef } from 'react'
import tw from 'twin.macro'

import type { IconName } from '../icon/icons'
import { Icon } from '../icon/Icon'
import { Button } from '../button/Button'

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

  const variant = primary ? 'solid' : 'subtle'
  return (
    <Button tw="flex-1" variant={variant} onClick={onClick} ref={buttonRef}>
      {children}
    </Button>
  )
}

const Container = tw.div`
  flex flex-col w-full bg-black
  sm:(self-center mx-auto width[50vw])
`

const Body = tw.div`p-6 space-y-4 flex-1`

const IconWrapper = (props: { icon: IconName }) => (
  <div tw="w-12 h-12 bg-green-900 rounded-full">
    <Icon tw="w-12" name={props.icon} color="green500" />
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
  <Container tw="lg:w-1/4">
    <Body>
      {props.icon && <IconWrapper icon={props.icon} />}
      <header tw="text-green-500">{props.title}</header>
      <p tw="text-sm">{props.children}</p>
    </Body>
    <footer tw="flex">
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
  <Container tw="lg:w-1/3">
    <Body>
      {props.icon && <IconWrapper icon={props.icon} />}
      <header tw="text-green-500">{props.title}</header>
      <p tw="text-sm">{props.children}</p>
    </Body>
    <footer tw="flex">
      <ActionButton onClick={props.onCancel}>{props.cancelText}</ActionButton>
      <ActionButton primary onClick={props.onConfirm}>
        {props.confirmText}
      </ActionButton>
    </footer>
  </Container>
)
