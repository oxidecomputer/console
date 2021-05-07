import { spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'
import { styled } from 'twin.macro'
import Icon from '../../../icon/Icon'
import { Tooltip } from '../../../tooltip/Tooltip'

const IconContainer = styled.div`
  padding: ${spacing(0, 2.25)};
  font-size: ${spacing(5)};
`
export const InfoPopover: FC = ({ children }) => (
  <Tooltip isPrimaryLabel={false} content={children}>
    <IconContainer>
      <Icon name="infoFilled" color="gray300" />
    </IconContainer>
  </Tooltip>
)
