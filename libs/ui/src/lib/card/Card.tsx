import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import { ReactComponent as Sparkline } from './sparkline.svg'
import cn from 'classnames'

export interface CardProps {
  title: string
  subtitle: string
  className?: string
}

export const Card = (props: CardProps) => {
  const tableId = useMemo(() => uuid(), [])

  return (
    <article className={cn('text-white bg-green-900', props.className)}>
      <main className="p-4">
        <div className="text-lg uppercase">{props.title}</div>
        <div className="text-sm">{props.subtitle}</div>
        <div className="flex my-6">
          <div
            className="grid grid-cols-2 grid-rows-2 gap-x-6 text-sm uppercase items-baseline"
            role="table"
            aria-label={props.title}
            aria-describedby={tableId}
          >
            <span id={tableId} role="columnheader" className="text-green-500">
              Heading
            </span>
            <span role="columnheader" className="text-green-500">
              Data
            </span>
            <div role="cell" className="text-xl text-white">
              3
            </div>
            <div role="cell" className="text-white">
              3%
            </div>
          </div>
          <section className="self-end">
            <Sparkline className="stroke-current text-green-500" />
          </section>
        </div>
      </main>
    </article>
  )
}
