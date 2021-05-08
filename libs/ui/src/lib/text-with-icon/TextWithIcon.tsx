import type { FC } from 'react'
import React from 'react'

import { styled } from 'twin.macro'

import { Text } from '../text/Text'
import type { TextProps } from '../text/Text'
import { Icon } from '../icon/Icon'
import type { IconProps } from '../icon/Icon'

export interface TextWithIconProps {
  align?: 'left' | 'right'
  className?: string
  icon: IconProps
  text?: TextProps
}

/* Once Safari supports `gap` with flex layouts, this can be removed */
const StyledIcon = styled(Icon)<{ align: 'left' | 'right' }>`
  ${({ align }) => align === 'left' && `margin-right: 0.5em;`};
  ${({ align }) => align === 'right' && `margin-left: 0.5em;`};
`

/* Note: this does not handle alignment when Text wraps or becomes a paragraph. `align-items: flex-start` does not align the icon with the center of the first line of text, instead it requires some kind of `padding-top` in order to be truly centered aligned. Since Icon and Text have a variable font-size, this top padding is hard to quantify. A different solution may be required for the paragraph use case. Cross that bridge when we get to it. */
const StyledText = styled(Text)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: top;
`

export const TextWithIcon: FC<TextWithIconProps> = ({
  align = 'left',
  className,
  children,
  icon,
  text,
}) => {
  return (
    <StyledText className={className} {...text}>
      {align === 'left' ? <StyledIcon align="left" {...icon} /> : null}
      {children}
      {align === 'right' ? <StyledIcon align="right" {...icon} /> : null}
    </StyledText>
  )
}
