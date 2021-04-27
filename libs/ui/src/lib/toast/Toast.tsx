import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'
import Icon from '../icon/Icon'
import type { IconName } from '../icon/icons'
import Text from '../text/Text'

export interface ToastProps {
  title: string
  content?: string

  icon?: IconName

  onClose: () => void

  children?: never
}

const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;

  padding: ${({ theme }) => theme.spacing(4)};

  background-color: ${({ theme }) => theme.color('gray800')};

  // FIXME: figure out a better way to size this
  width: 384px;

  ${({ theme }) => theme.spaceBetweenX(3)}
`

const IconWrapper = styled.div`
  flex: 0 0 auto;

  font-size: ${({ theme }) => theme.spacing(6)};
`

const Content = styled.div<{ hasIcon: boolean }>`
  flex: 1;

  display: flex;
  flex-direction: column;

  ${({ theme, hasIcon }) =>
    hasIcon &&
    css`
      padding: ${theme.spacing(0.5, 0)};
    `};

  ${({ theme }) => theme.spaceBetweenY(1)}
`

const ActionButton = styled.button`
  flex: 0 0 auto;
  text-transform: uppercase;
`

const CloseButton = styled.button`
  display: flex;
  justify-content: center;

  flex: 0 0 auto;
  height: ${({ theme }) => theme.spacing(5)};
`

export const Toast: FC<ToastProps> = ({ title, content, icon, onClose }) => (
  <Wrapper>
    {icon && (
      <IconWrapper>
        <Icon name={icon} color="green600" />
      </IconWrapper>
    )}
    <Content hasIcon={!!icon}>
      <Text size="sm" weight={500} color="gray50">
        {title}
      </Text>
      {content && (
        <Text size="sm" weight={400} color="gray300">
          {content}
        </Text>
      )}
    </Content>
    <CloseButton
      onClick={() => {
        onClose()
      }}
    >
      <Icon name="close" color="gray300" />
    </CloseButton>
  </Wrapper>
)

export interface ActionToastProps extends ToastProps {
  action: string
  onAction: () => void
}
export const ActionToast: FC<ActionToastProps> = ({
  icon,
  title,
  content,
  onClose,

  action,
  onAction,
}) => (
  <Wrapper>
    {icon && (
      <IconWrapper>
        <Icon name={icon} color="green600" />
      </IconWrapper>
    )}
    <Content hasIcon={!!icon}>
      <Text size="sm" weight={500} color="gray50">
        {title}
      </Text>
      {content && (
        <Text size="sm" weight={400} color="gray300">
          {content}
        </Text>
      )}
    </Content>
    <ActionButton
      onClick={() => {
        onAction()
      }}
    >
      <Text size="sm" weight={400} color="green600">
        {action}
      </Text>
    </ActionButton>
    <CloseButton
      onClick={() => {
        onClose()
      }}
    >
      <Icon name="close" color="gray300" />
    </CloseButton>
  </Wrapper>
)
