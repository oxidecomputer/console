import { capitalize } from '@oxide/util'
import type { ReactNode } from 'react'
import React from 'react'
import cn from 'classnames'

/**
 * This is a utility component that helps prettify sections of stories when there are a lot of
 * component variations to show.
 */
export const Section = ({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) => (
  <section className={cn(className, 'mb-8 mr-8')}>
    <h2 className="mb-4 border-b border-green-800 pb-4 text-green-500 text-sans-2xl">
      {capitalize(title)}
    </h2>
    {children}
  </section>
)
