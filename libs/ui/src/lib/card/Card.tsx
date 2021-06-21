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
    <article tw="text-green-50" className={props.className}>
      <main tw="p-4 bg-dark-green-800">
        <div tw="text-lg uppercase">{props.title}</div>
        <div tw="text-sm">{props.subtitle}</div>
        <div tw="flex mt-6 mb-16">
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
                stroke: theme`colors.green`,
                strokeOpacity: 0.8,
              }}
            />
          </section>
        </div>
      </main>
      <footer tw="flex text-xs py-2 px-4 bg-dark-green-900 items-baseline uppercase">
        Optional link
      </footer>
    </article>
  )
}
