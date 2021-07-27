import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import Sparkline from './sparkline.svg'
import cn from 'classnames'

export interface CardProps {
  title: string
  subtitle: string
  className?: string
}

export const Card = (props: CardProps) => {
  const tableId = useMemo(() => uuid(), [])

  return (
    <article
      className={cn(
        'text-white border border-gray-400 rounded',
        props.className
      )}
    >
      <main className="p-4">
        <div className="text-display-lg mb-2">{props.title}</div>
        <div className="text-sm">{props.subtitle}</div>
        <div className="flex mt-6 mb-3">
          <div
            className="grid grid-cols-2 grid-rows-2 gap-x-6 text-sm uppercase items-baseline"
            role="table"
            aria-label={props.title}
            aria-describedby={tableId}
          >
            <span
              id={tableId}
              role="columnheader"
              className="text-green-500 font-mono"
            >
              Heading
            </span>
            <span role="columnheader" className="text-green-500 font-mono">
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

export const SparklineSVG = Sparkline
