import type { FC } from 'react'
import React from 'react'
import cn from 'classnames'

import EmptyStateLeft from '../../assets/empty-state-left.svg'
import EmptyStateRight from '../../assets/empty-state-right.svg'
import type { ChildrenProp } from 'libs/ui/util/children'

const decoration = 'z-0 absolute w-full max-w-[11rem] overflow-hidden'

export interface EmptyStateProps extends ChildrenProp {}

export const EmptyState: FC = ({ children }: EmptyStateProps) => (
  <div className="flex items-center justify-center relative min-h-[50vh] overflow-hidden">
    <div className={cn(decoration, 'top-0 left-0')}>
      <EmptyStateLeft />
    </div>
    <div className="z-10 mx-auto p-6 max-w-lg">{children}</div>
    <div className={cn(decoration, 'bottom-0 right-0')}>
      <EmptyStateRight />
    </div>
  </div>
)
