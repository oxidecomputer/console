/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

import { DirectionLeftIcon, DirectionRightIcon } from '@oxide/design-system/icons/react'

import { Spinner } from './Spinner'

interface PageInputProps {
  number: number
  className?: string
}
const PageInput = ({ number, className }: PageInputProps) => {
  return (
    <span
      className={cn(
        'text-mono-sm text-default bg-tertiary ring-secondary h-4 rounded px-[3px] pt-px pb-[3px] whitespace-nowrap ring ring-inset',
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
  nextPage: string | undefined | null
  onNext: (nextPage: string) => void
  onPrev: () => void
  className?: string
  loading?: boolean
}
export const Pagination = ({
  pageSize,
  hasNext,
  hasPrev,
  nextPage,
  onNext,
  onPrev,
  className,
  loading,
}: PaginationProps) => {
  return (
    <>
      <nav
        aria-label="Pagination"
        className={cn(
          'text-mono-sm text-raise bg-default flex items-center justify-between',
          className
        )}
      >
        <span className="flex-inline text-secondary grow">
          rows per page <PageInput number={pageSize} />
        </span>
        <span className="flex items-center space-x-3">
          {loading && <Spinner />}
          <button
            type="button"
            className={cn(
              hasPrev ? 'text-default hover:text-raise' : 'text-disabled',
              'text-mono-sm flex items-center'
            )}
            disabled={!hasPrev}
            onClick={onPrev}
          >
            <DirectionLeftIcon
              className={cn('mr-1', hasPrev ? 'text-default' : 'text-disabled')}
            />
            prev
          </button>
          <button
            type="button"
            className={cn(
              hasNext ? 'text-default hover:text-raise' : 'text-disabled',
              'text-mono-sm flex items-center'
            )}
            disabled={!hasNext}
            // nextPage will be defined if hasNext is true
            onClick={onNext.bind(null, nextPage!)}
          >
            next
            <DirectionRightIcon
              className={cn('ml-1', hasNext ? 'text-default' : 'text-disabled')}
            />
          </button>
        </span>
      </nav>
    </>
  )
}
