import { styled } from 'twin.macro'
import type { Color } from '@oxide/css-helpers'
import { color as getColor } from '@oxide/css-helpers'
import type { IconComponentProps } from './IconComponent'
import { IconComponent } from './IconComponent'

export interface IconProps extends IconComponentProps {
  align?: 'left' | 'right'
  color?: Color
  /**
   * Amount to rotate the SVG icon (useful for "chevron"); expects a number followed by an [angle](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) unit: `90deg`, `0.5turn`
   */
  rotate?: string
}

const propsToForward: PropertyKey[] = ['className', 'svgProps', 'name']

// Do not pass 'align', 'color', 'rotate' (etc) props to the DOM
// but do pass 'svgProps' to SvgIcon
export const Icon = styled(IconComponent, {
  shouldForwardProp: (prop) => propsToForward.includes(prop),
})<IconProps>`
  align-self: center; /* displays correct height for Safari */
  flex-shrink: 0;

  height: auto;
  width: 1em; /* icon size is controlled by parent font-size */

  fill: ${({ color }) => (color ? getColor(color) : 'currentColor')};

  ${({ rotate }) => rotate && `transform: rotate(${rotate})`};

  ${({ align }) => align === 'left' && `margin-right: 0.5em;`}
  ${({ align }) => align === 'right' && `margin-left: 0.5em;`}
`

export default Icon
