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
          'flex space-between text-mono-sm uppercase text-gray-100 items-center',
          className
        )}
      >
        <span className="flex-grow text-gray-200 flex-inline">
          rows per page <PageInput number={pageSize} />
        </span>
        {(hasNext || hasPrev) && (
          <span className="space-x-2 flex">
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
