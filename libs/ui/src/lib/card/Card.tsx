import React, { useMemo } from 'react'

import { v4 as uuid } from 'uuid'
import tw, { theme } from 'twin.macro'
import Sparkline from './sparkline.svg'

export interface CardProps {
  title: string
  subtitle: string
  className?: string
}

const DataTable = tw.div`grid grid-cols-2 grid-rows-2 gap-x-6 text-sm uppercase`

const dataValue = tw`text-gray-50 align-self[baseline]`

export const Card = (props: CardProps) => {
  const tableId = useMemo(() => uuid(), [])

  return (
    <article tw="text-green-50 bg-green-tint" className={props.className}>
      <main tw="p-4">
        <div tw="text-lg uppercase">{props.title}</div>
        <div tw="text-sm">{props.subtitle}</div>
        <div tw="flex my-6">
          <DataTable
            role="table"
            aria-label={props.title}
            aria-describedby={tableId}
          >
            <span id={tableId} role="columnheader" tw="text-green">
              Heading
            </span>
            <span role="columnheader" tw="text-green">
              Data
            </span>
            <div role="cell" css={dataValue} tw="text-xl">
              3
            </div>
            <div role="cell" css={dataValue}>
              3%
            </div>
          </DataTable>
          <section tw="self-end">
            <Sparkline
              style={{
                stroke: theme`colors.green.DEFAULT`,
                strokeOpacity: 0.8,
              }}
            />
          </section>
        </div>
      </main>
    </article>
  )
}
