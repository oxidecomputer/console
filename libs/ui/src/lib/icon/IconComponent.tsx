import type { FC } from 'react'
import React from 'react'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { IconName } from './icons'
import { icons } from './icons'

export interface IconComponentProps {
  /**
   * Name (which corresponds to the `<title>`) of the SVG
   */
  name: IconName

  /**
   * Props to pass directly to the SVG
   */
  svgProps?: React.SVGProps<SVGSVGElement> & {
    title?: string
    titleId?: string
  }
}

export const IconComponent: FC<IconComponentProps> = ({
  name,
  svgProps,
  ...props
}) => {
  const Component = icons[name]

  const titleId = useMemo(() => uuidv4(), [])
  if (!IconComponent) {
    console.warn('Cannot find icon for: ', name)
    return null
  }
  let addSvgProps = { ...svgProps }

  // All icons should have a default <title> tag
  // Generate a titleId here so that the `id` and corresponding `aria-labelledby`
  // attributes are always unique
  // TODO: Allow icon to have the equivalent of an empty alt="" tag
  if (!addSvgProps.titleId) {
    addSvgProps = { titleId: titleId, ...svgProps }
  }

  return <Component {...addSvgProps} {...props} />
}
