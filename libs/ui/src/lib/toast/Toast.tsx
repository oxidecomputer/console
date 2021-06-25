import React from 'react'
import cn from 'classnames'

import { Button } from '../button/Button'
import { Icon } from '../icon/Icon'
import type { IconName } from '../icon/icons'
import { TimeoutIndicator } from '../timeout-indicator/TimeoutIndicator'
import { classed } from '../../util/classed'

interface BaseToastProps {
  title: string
  content?: string
  icon?: IconName
  onClose: () => void
}

export interface ToastProps extends BaseToastProps {
  timeout?: number
}

const Wrapper = classed.div`w-96 inline-flex items-stretch bg-gray-400 shadow-lg`

const Main = classed.div`flex flex-1 items-start p-4 space-x-3`

const IconWrapper = classed.div`text-2xl leading-none`

const contentStyle = (hasIcon: boolean) =>
  cn('flex flex-col flex-1 space-y-1', hasIcon && 'py-0.5')

const CloseButton = classed.button`flex flex-initial content-center h-5`

const TitleText = classed.span`text-sm font-medium text-white`
const BodyText = classed.span`text-sm text-gray-50`

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
          <Icon name={icon} className="text-green-600" />
        </IconWrapper>
      )}
      <div className={contentStyle(!!icon)}>
        <TitleText>{title}</TitleText>
        {content && <BodyText> {content}</BodyText>}
      </div>
      <CloseButton onClick={() => onClose()}>
        {timeout !== undefined ? (
          <TimeoutIndicator timeout={timeout} onTimeoutEnd={onClose}>
            <Icon name="close" className="text-gray-50" />
          </TimeoutIndicator>
        ) : (
          <Icon name="close" className="text-gray-50" />
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
          <Icon name={icon} className="text-green-600" />
        </IconWrapper>
      )}
      <div className={contentStyle(!!icon)}>
        <TitleText>{title}</TitleText>
        {content && <BodyText>{content}</BodyText>}
      </div>
      <button
        className="uppercase text-sm text-green-600"
        onClick={() => onAction()}
      >
        {action}
      </button>
      <CloseButton onClick={() => onClose()}>
        <Icon name="close" className="text-gray-50" />
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

const SplitActions = classed.div`flex flex-col border-l border-gray-50`

const SplitActionContainer = classed.div`flex flex-1 first-of-type:(border-b border-gray-50)`

export const ConfirmToast = ({
  icon,
  title,
  content,
  confirm,
  onConfirm,
  cancel,
  onCancel,
}: ConfirmToastProps) => (
  <Wrapper className="w-[28rem]">
    <Main>
      {icon && (
        <IconWrapper>
          <Icon name={icon} className="text-green-600" />
        </IconWrapper>
      )}

      <div className={contentStyle(!!icon)}>
        <TitleText>{title}</TitleText>
        {content && <BodyText>{content}</BodyText>}
      </div>
    </Main>

    <SplitActions>
      <SplitActionContainer>
        <Button
          className="flex-1 text-green-600"
          variant="ghost"
          onClick={() => onConfirm()}
        >
          {confirm}
        </Button>
      </SplitActionContainer>
      <SplitActionContainer>
        <Button
          className="flex-1 text-gray-50"
          variant="ghost"
          onClick={() => onCancel()}
        >
          {cancel}
        </Button>
      </SplitActionContainer>
    </SplitActions>
  </Wrapper>
)
