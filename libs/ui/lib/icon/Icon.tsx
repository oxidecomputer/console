import React from 'react'
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import cn from 'classnames'

import type { IconName } from './icons'
import { icons } from './icons'

export interface IconProps {
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

  className?: string
}

export const Icon = ({ name, svgProps, className, ...props }: IconProps) => {
  const Component = icons[name]

  const titleId = useMemo(() => uuidv4(), [])
  let addSvgProps = { ...svgProps }

  // All icons should have a default <title> tag
  // Generate a titleId here so that the `id` and corresponding `aria-labelledby`
  // attributes are always unique
  // TODO: Allow icon to have the equivalent of an empty alt="" tag
  if (!addSvgProps.titleId) {
    addSvgProps = { titleId: titleId, ...svgProps }
  }

  // h-full is for safari, which handles h-auto badly, unlike everyone else
  return (
    <Component
      className={cn('h-[1.25em] w-[1.25em] fill-current', className)}
      {...addSvgProps}
      {...props}
    />
  )
}
