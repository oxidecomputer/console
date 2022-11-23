import cn from 'classnames'
import type { ReactNode } from 'react'

import { capitalize } from '@oxide/util'

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
    <h2 className="mb-4 border-b pb-4 text-sans-2xl text-accent border-accent-secondary">
      {capitalize(title)}
    </h2>
    {children}
  </section>
)
