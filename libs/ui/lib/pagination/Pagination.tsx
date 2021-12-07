import React from 'react'
import { DirectionLeftIcon, DirectionRightIcon } from '../icons'

interface PageInputProps {
  number: number
}
const PageInput = ({ number }: PageInputProps) => {
  return (
    <span className="ring-1 ring-inset ring-gray-400 text-gray-100 inline-flex items-baseline uppercase text-mono-sm rounded-sm h-4 py-[1px] px-[3px] whitespace-nowrap">
      {number}
    </span>
  )
}

interface PaginationProps {
  fullWidth?: boolean
  pageSize: number
  currentPage: number
  numPages: number
  onNext: () => void
  onPrev: () => void
}
export const Pagination = ({
  pageSize,
  currentPage,
  numPages,
  onNext,
  onPrev,
}: PaginationProps) => {
  const hasPrev = currentPage > 1
  const hasNext = numPages > currentPage
  return (
    <div className="flex space-between text-mono-sm uppercase text-gray-100">
      <span className="flex-grow text-gray-200">
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
  )
}
