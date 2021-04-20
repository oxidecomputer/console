import styled from 'styled-components'
import type { Color } from '@oxide/theme'
import type { IconComponentProps } from './IconComponent'
import { IconComponent } from './IconComponent'

export interface IconProps extends IconComponentProps {
  /**
   * Add optional margin
   */
  align?: 'left' | 'right'
  /**
   * Set the color using a theme color ("green500")
   */
  color?: Color
  /**
   * Amount to rotate the SVG icon (useful for "chevron"); expects a number followed by an [angle](https://developer.mozilla.org/en-US/docs/Web/CSS/angle) unit: `90deg`, `0.5turn`
   */
  rotate?: string
}

export const Icon = styled(IconComponent).withConfig({
  shouldForwardProp: (prop) => {
    // Do not pass 'align', 'color', 'rotate' (etc) props to the DOM
    // but do pass 'svgProps' to SvgIcon
    return ['className', 'svgProps', 'name'].includes(prop)
  },
})<IconProps>`
  align-self: center; /* displays correct height for Safari */
  flex-shrink: 0;

  height: auto;
  width: 1em; /* icon size is controlled by parent font-size */

  fill: ${({ color, theme }) =>
    color ? theme.themeColors[color] : 'currentColor'};

  ${({ rotate }) => rotate && `transform: rotate(${rotate})`};
  ${({ align }) => {
    if (align === 'left') {
      return `margin-right: 0.5em;`
    }
    if (align === 'right') {
      return `margin-left: 0.5em;`
    }
  }}
`

export default Icon
