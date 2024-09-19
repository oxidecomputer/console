/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { DirectionLeftIcon, DirectionRightIcon } from '@oxide/design-system/icons/react'

interface PageInputProps {
  number: number
  className?: string
}
const PageInput = ({ number, className }: PageInputProps) => {
  return (
    <span
      className={cn(
        'h-4 whitespace-nowrap rounded px-[3px] pb-[3px] pt-[1px] ring-1 ring-inset text-mono-sm text-secondary bg-tertiary ring-secondary',
        className
      )}
    >
      {number}
    </span>
  )
}

export interface PaginationProps {
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: string | undefined
  onNext: (nextPage: string) => void
  onPrev: () => void
  className?: string
}
export const Pagination = ({
  pageSize,
  hasNext,
  hasPrev,
  nextPage,
  onNext,
  onPrev,
  className,
}: PaginationProps) => {
  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between text-mono-sm text-default bg-default',
          className
        )}
      >
        <span className="flex-inline grow text-tertiary">
          rows per page <PageInput number={pageSize} />
        </span>
        <span className="flex space-x-3">
          <button
            type="button"
            className={cn(
              hasPrev ? 'text-secondary hover:text-default' : 'text-disabled',
              'flex items-center text-mono-sm'
            )}
            disabled={!hasPrev}
            onClick={onPrev}
          >
            <DirectionLeftIcon
              className={cn('mr-1', hasPrev ? 'text-secondary' : 'text-disabled')}
            />
            prev
          </button>
          <button
            type="button"
            className={cn(
              hasNext ? 'text-secondary hover:text-default' : 'text-disabled',
              'flex items-center text-mono-sm'
            )}
            disabled={!hasNext}
            // nextPage will be defined if hasNext is true
            onClick={onNext.bind(null, nextPage!)}
          >
            next
            <DirectionRightIcon
              className={cn('ml-1', hasNext ? 'text-secondary' : 'text-disabled')}
            />
          </button>
        </span>
      </div>
    </>
  )
}
