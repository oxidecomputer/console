import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import type { IconProps } from '../icon/Icon'
import Icon from '../icon/Icon'

const IconWrapper = styled.span`
  padding: ${({ theme }) => theme.spacing(2.25)};
`

export const IconAccesory: FC<IconProps> = (props) => (
  <IconWrapper>
    <Icon {...props} />
  </IconWrapper>
)
