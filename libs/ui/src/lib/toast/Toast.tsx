import { color, shadow, spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'

import tw, { css, styled } from 'twin.macro'
import Button from '../button/Button'
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

const Wrapper = styled.div<{ wide?: boolean }>`
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;

  background-color: ${color('gray800')};

  // FIXME: figure out a better way to size this
  width: ${({ wide }) => (wide ? 448 : 384)}px;

  ${shadow('lg')}
`

const Main = styled.div<{ withActions?: boolean }>`
  flex: 1;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;

  ${tw`space-x-3`}

  padding: ${({ withActions }) =>
    withActions ? spacing(4, 0, 4, 4) : spacing(4)};
`

const IconWrapper = styled.div`
  flex: 0 0 auto;

  font-size: ${spacing(6)};
`

const Content = styled.div<{ hasIcon: boolean }>`
  flex: 1;

  display: flex;
  flex-direction: column;

  ${({ hasIcon }) =>
    hasIcon &&
    css`
      padding: ${spacing(0.5, 0)};
    `};

  ${tw`space-y-1`}
`

const ActionButton = styled.button`
  flex: 0 0 auto;
  text-transform: uppercase;
`

const CloseButton = styled.button`
  display: flex;
  justify-content: center;

  flex: 0 0 auto;
  height: ${spacing(5)};
`

export const Toast: FC<ToastProps> = ({ title, content, icon, onClose }) => (
  <Wrapper>
    <Main>
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
    </Main>
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
    <Main>
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
    </Main>
  </Wrapper>
)

export interface ConfirmToastProps extends ToastProps {
  confirm: string
  cancel: string

  onConfirm: () => void
  onCancel: () => void
}

const SplitActions = styled.div`
  flex: 0 0 auto;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  border-left: 1px solid ${color('gray300')};
`

const SplitActionContainer = styled.div`
  flex: 1;

  display: flex;

  justify-content: stretch;
  align-items: stretch;

  :first-child {
    border-bottom: 1px solid ${color('gray300')};
  }
`

const SplitAction = styled(Button)`
  flex: 1;
`

export const ConfirmToast: FC<ConfirmToastProps> = ({
  icon,
  title,
  content,

  confirm,
  onConfirm,
  cancel,
  onCancel,
}) => (
  <Wrapper wide>
    <Main>
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
    </Main>

    <SplitActions>
      <SplitActionContainer>
        <SplitAction
          variant="ghost"
          onClick={() => {
            onConfirm()
          }}
        >
          {confirm}
        </SplitAction>
      </SplitActionContainer>
      <SplitActionContainer>
        <SplitAction
          variant="ghost"
          onClick={() => {
            onCancel()
          }}
        >
          <Text color="gray300">{cancel}</Text>
        </SplitAction>
      </SplitActionContainer>
    </SplitActions>
  </Wrapper>
)
