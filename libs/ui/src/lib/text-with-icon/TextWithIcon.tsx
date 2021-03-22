import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../text/Text'
import type { TextProps } from '../text/Text'
import { Icon } from '../icon/Icon'
import type { IconProps } from '../icon/Icon'

/* eslint-disable-next-line */
export interface TextWithIconProps {
  align?: 'left' | 'right'
  icon: IconProps
  text?: TextProps
}

const StyledIcon = styled(Icon)<{ align: 'left' | 'right' }>`
  ${({ align }) => align === 'left' && `margin-right: 0.5em;`};
  ${({ align }) => align === 'right' && `margin-left: 0.5em;`};
`

const StyledText = styled(Text)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
`

export const TextWithIcon: FC<TextWithIconProps> = ({
  align = 'left',
  children,
  icon,
  text,
}) => {
  return (
    <StyledText {...text}>
      {align === 'left' ? <StyledIcon align="left" {...icon} /> : null}
      {children}
      {align === 'right' ? <StyledIcon align="right" {...icon} /> : null}
    </StyledText>
  )
}
