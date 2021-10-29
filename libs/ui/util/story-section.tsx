import { capitalize } from 'app/util/str'
import type { ReactNode } from 'react'
import React from 'react'

/**
 * This is a utility component that helps prettify sections of stories when there are a lot of
 * component variations to show.
 */
export const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section className="mb-8 mr-8">
    <h2 className="text-display-2xl text-green-500 border-green-800 border-b pb-4 mb-4">
      {capitalize(title)}
    </h2>
    {children}
  </section>
)
