import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import type { IconProps } from '../icon/Icon'
import Icon from '../icon/Icon'

const IconWrapper = styled.span`
  padding: ${({ theme }) => theme.spacing(2.25)};
`

/**
 * `IconAccessory` should be used when you want to use an Icon in the place of an accessory for a `TextField`
 * This centralizes the spacings used to position icons in a single place, instead of relying on any consumer to space it themselves.
 *
 * Functionally this is identical to an `Icon`, and has the same prop requirements
 */
export const IconAccessory: FC<IconProps> = (props) => (
  <IconWrapper>
    <Icon {...props} />
  </IconWrapper>
)
