import React from 'react'
import tw, { styled } from 'twin.macro'

import Button from '../button/Button'
import { Icon } from '../icon/Icon'
import type { IconName } from '../icon/icons'
import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'

interface BaseToastProps {
  title: string
  content?: string
  icon?: IconName
  onClose: () => void
}

export interface ToastProps extends BaseToastProps {
  timeout?: number
}

const Wrapper = tw.div`w-96 inline-flex items-stretch bg-gray-800 shadow-lg`

const Main = tw.div`flex flex-1 items-start p-4 space-x-3`

const IconWrapper = tw.div`font-size[1.5rem]`

const Content = styled.div<{ hasIcon: boolean }>(() => [
  tw`flex flex-col flex-1 space-y-1`,
  ({ hasIcon }) => hasIcon && tw`py-0.5`,
])

const CloseButton = tw.button`flex flex-initial content-center h-5`

const TitleText = tw.span`text-sm font-medium text-gray-50`
const BodyText = tw.span`text-sm text-gray-300`

export const Toast = ({
  title,
  content,
  icon,
  onClose,
  timeout,
}: ToastProps) => (
  <Wrapper>
    <Main>
      {icon && (
        <IconWrapper>
          <Icon name={icon} color="green600" />
        </IconWrapper>
      )}
      <Content hasIcon={!!icon}>
        <TitleText>{title}</TitleText>
        {content && <BodyText> {content}</BodyText>}
      </Content>
      <CloseButton onClick={() => onClose()}>
        {timeout !== undefined ? (
          <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose}>
            <Icon name="close" color="gray300" />
          </TimeoutIndicator>
        ) : (
          <Icon name="close" color="gray300" />
        )}
      </CloseButton>
    </Main>
  </Wrapper>
)

export interface ActionToastProps extends BaseToastProps {
  action: string
  onAction: () => void
}
export const ActionToast = ({
  icon,
  title,
  content,
  onClose,
  action,
  onAction,
}: ActionToastProps) => (
  <Wrapper>
    <Main>
      {icon && (
        <IconWrapper>
          <Icon name={icon} color="green600" />
        </IconWrapper>
      )}
      <Content hasIcon={!!icon}>
        <TitleText>{title}</TitleText>
        {content && <BodyText>{content}</BodyText>}
      </Content>
      <button tw="uppercase text-sm text-green-600" onClick={() => onAction()}>
        {action}
      </button>
      <CloseButton onClick={() => onClose()}>
        <Icon name="close" color="gray300" />
      </CloseButton>
    </Main>
  </Wrapper>
)

export interface ConfirmToastProps extends BaseToastProps {
  confirm: string
  cancel: string

  onConfirm: () => void
  onCancel: () => void
}

const SplitActions = tw.div`flex flex-col border-l border-gray-300`

const SplitActionContainer = tw.div`flex flex-1 first-of-type:(border-b border-gray-300)`

export const ConfirmToast = ({
  icon,
  title,
  content,
  confirm,
  onConfirm,
  cancel,
  onCancel,
}: ConfirmToastProps) => (
  <Wrapper tw="width[28rem]">
    <Main>
      {icon && (
        <IconWrapper>
          <Icon name={icon} color="green600" />
        </IconWrapper>
      )}

      <Content hasIcon={!!icon}>
        <TitleText>{title}</TitleText>
        {content && <BodyText>{content}</BodyText>}
      </Content>
    </Main>

    <SplitActions>
      <SplitActionContainer>
        <Button
          tw="flex-1 text-green-600"
          variant="ghost"
          onClick={() => onConfirm()}
        >
          {confirm}
        </Button>
      </SplitActionContainer>
      <SplitActionContainer>
        <Button
          tw="flex-1 text-gray-300"
          variant="ghost"
          onClick={() => onCancel()}
        >
          {cancel}
        </Button>
      </SplitActionContainer>
    </SplitActions>
  </Wrapper>
)
