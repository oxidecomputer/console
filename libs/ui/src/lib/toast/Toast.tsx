import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'
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

  padding: ${({ theme }) => theme.spacing(4)};

  background-color: ${({ theme }) => theme.color('gray800')};

  ${({ theme }) => theme.spaceBetweenX(3)}
`

const IconWrapper = styled.div`
  flex: 0 0 auto;

  font-size: ${({ theme }) => theme.spacing(6)};
`

const Content = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;

  padding: ${({ theme }) => theme.spacing(0.5, 0)};

  ${({ theme }) => theme.spaceBetweenY(1)}
`

const CloseWrapper = styled.div`
  flex: 0 0 auto;
`

export const Toast: FC<ToastProps> = ({ title, content, icon, onClose }) => {
  return (
    <Wrapper>
      {icon && (
        <IconWrapper>
          <Icon name={icon} color="green600" />
        </IconWrapper>
      )}
      <Content>
        <Text size="sm" weight={500} color="gray50">
          {title}
        </Text>
        {content && (
          <Text size="sm" weight={400} color="gray300">
            {content}
          </Text>
        )}
      </Content>
      <CloseWrapper>
        <button
          onClick={() => {
            onClose()
          }}
        >
          <Icon name="close" color="gray300" />
        </button>
      </CloseWrapper>
    </Wrapper>
  )
}
