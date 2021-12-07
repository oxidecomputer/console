import React from 'react'
import { DirectionLeftIcon, DirectionRightIcon } from '../icons'
import cn from 'classnames'

interface PageInputProps {
  number: number
  className?: string
}
const PageInput = ({ number, className }: PageInputProps) => {
  return (
    <span
      className={cn(
        'ring-1 ring-inset ring-gray-400 text-gray-100 uppercase text-mono-sm rounded-sm h-4 pb-[3px] pt-[1px] px-[3px] whitespace-nowrap',
        className
      )}
    >
      {number}
    </span>
  )
}

interface PaginationProps {
  pageLevel?: boolean
  pageSize: number
  currentPage: number
  numPages: number
  onNext: () => void
  onPrev: () => void
}
export const Pagination = ({
  pageLevel,
  pageSize,
  currentPage,
  numPages,
  onNext,
  onPrev,
}: PaginationProps) => {
  const hasPrev = currentPage > 1
  const hasNext = numPages > currentPage
  return (
    <>
      {pageLevel && (
        <hr className="absolute bottom-14 border-t w-full !col-span-3 border-gray-500" />
      )}
      <div
        className={cn(
          'flex space-between text-mono-sm uppercase text-gray-100',
          (pageLevel &&
            'absolute bottom-0 w-full !col-start-2 !col-end-2 py-5') ||
            'mt-2.5'
        )}
      >
        <span className="flex-grow text-gray-200 flex-inline">
          rows per page <PageInput number={pageSize} />
        </span>
        <span className="space-x-2 flex items-center">
          <button
            className="flex items-center"
            disabled={!hasPrev}
            onClick={onPrev}
          >
            <DirectionLeftIcon
              title="previous page"
              className={hasPrev ? 'text-gray-50' : 'text-gray-400'}
            />
          </button>
          <span>
            <PageInput number={currentPage} /> of{' '}
            <span className="text-gray-50">{numPages}</span>
          </span>
          <button
            className="flex items-center"
            disabled={!hasNext}
            onClick={onNext}
          >
            <DirectionRightIcon
              title="next page"
              className={hasNext ? 'text-gray-50' : 'text-gray-400'}
            />
          </button>
        </span>
      </div>
    </>
  )
}
