import { styled } from 'twin.macro'
import type { Color } from '@oxide/css-helpers'
import { color as getColor } from '@oxide/css-helpers'
import type { IconComponentProps } from './IconComponent'
import { IconComponent } from './IconComponent'

export interface IconProps extends IconComponentProps {
  color?: Color
}

const propsToForward: PropertyKey[] = ['className', 'svgProps', 'name']

export const Icon = styled(IconComponent, {
  shouldForwardProp: (prop) => propsToForward.includes(prop),
})<IconProps>`
  align-self: center; /* displays correct height for Safari */
  flex-shrink: 0;

  height: auto;
  width: 1em; /* icon size is controlled by parent font-size */

  fill: ${({ color }) => (color ? getColor(color) : 'currentColor')};
`

export default Icon
