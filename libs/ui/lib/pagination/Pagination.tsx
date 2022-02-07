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
        'h-4 whitespace-nowrap rounded-sm px-[3px] pb-[3px] pt-[1px] uppercase text-gray-100 ring-1 ring-inset ring-gray-400 text-mono-sm',
        className
      )}
    >
      {number}
    </span>
  )
}

export interface PaginationProps {
  type?: 'inline' | 'page'
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: string | undefined
  onNext: (nextPage: string) => void
  onPrev: () => void
  className?: string
}
export const Pagination = ({
  type = 'inline',
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
          type === 'page' && 'py-5',
          'space-between flex items-center uppercase text-gray-100 text-mono-sm',
          className
        )}
      >
        <span className="flex-inline flex-grow text-gray-200">
          rows per page <PageInput number={pageSize} />
        </span>
        {(hasNext || hasPrev) && (
          <span className="flex space-x-2">
            <button
              className={cn(
                !hasPrev && 'text-gray-300',
                'flex items-center uppercase'
              )}
              disabled={!hasPrev}
              onClick={onPrev}
            >
              <DirectionLeftIcon
                title="previous page"
                className={cn(
                  'mr-0.5',
                  hasPrev ? 'text-gray-50' : 'text-gray-400'
                )}
              />
              prev
            </button>
            <button
              className={cn(
                !hasNext && 'text-gray-300',
                'flex items-center uppercase'
              )}
              disabled={!hasNext}
              // nextPage will be defined if hasNext is true
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              onClick={onNext.bind(null, nextPage!)}
            >
              next
              <DirectionRightIcon
                title="next page"
                className={cn(
                  'ml-0.5',
                  hasNext ? 'text-gray-50' : 'text-gray-400'
                )}
              />
            </button>
          </span>
        )}
      </div>
    </>
  )
}
