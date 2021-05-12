import type { FC } from 'react'
import React from 'react'
import tw from 'twin.macro'

import EmptyStateLeft from '../../assets/empty-state-left.svg'
import EmptyStateRight from '../../assets/empty-state-right.svg'

const decoration = tw`z-0 absolute w-full max-width[11rem] overflow-hidden`

export const EmptyState: FC = ({ children }) => (
  <div tw="flex items-center justify-center relative min-height[50vh] overflow-hidden">
    <div css={decoration} tw="top-0 left-0">
      <EmptyStateLeft />
    </div>
    <div tw="z-10 mx-auto p-6 max-w-lg">{children}</div>
    <div css={decoration} tw="bottom-0 right-0">
      <EmptyStateRight />
    </div>
  </div>
)
