import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import Icon from '../../../icon/Icon'
import { Tooltip } from '../../../tooltip/Tooltip'

const IconContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0, 2.25)};
  font-size: ${({ theme }) => theme.spacing(5)};
`
export const InfoPopover: FC = ({ children }) => (
  <Tooltip isPrimaryLabel={false} content={children}>
    <IconContainer>
      <Icon name="infoFilled" color="gray300" />
    </IconContainer>
  </Tooltip>
)
