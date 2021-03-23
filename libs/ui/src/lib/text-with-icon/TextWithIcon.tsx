import type { FC } from 'react'
import React from 'react'

import styled from 'styled-components'

import { Text } from '../text/Text'
import type { TextProps } from '../text/Text'
import { Icon } from '../icon/Icon'
import type { IconProps } from '../icon/Icon'

export interface TextWithIconProps {
  align?: 'left' | 'right'
  icon: IconProps
  text?: TextProps
}

/* Note: this does not handle alignment when Text wraps or becomes a paragraph. `align-items: flex-start` does not align the icon with the center of the first line of text, instead it requires some kind of `padding-top` in order to be truly centered aligned. Since Icon and Text have a variable font-size, this top padding is hard to quantify. A different solution may be required for the paragraph use case. Cross that bridge when we get to it. */
const StyledText = styled(Text)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
  gap: 0.5em;
`

export const TextWithIcon: FC<TextWithIconProps> = ({
  align = 'left',
  children,
  icon,
  text,
}) => {
  return (
    <StyledText {...text}>
      {align === 'left' ? <Icon {...icon} /> : null}
      {children}
      {align === 'right' ? <Icon {...icon} /> : null}
    </StyledText>
  )
}
