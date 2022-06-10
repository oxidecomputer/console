import cn from 'classnames'

import { DirectionLeftIcon, DirectionRightIcon } from '../icons'

interface PageInputProps {
  number: number
  className?: string
}
const PageInput = ({ number, className }: PageInputProps) => {
  return (
    <span
      className={cn(
        'h-4 whitespace-nowrap rounded px-[3px] pb-[3px] pt-[1px] ring-1 ring-inset text-mono-sm text-secondary ring-default',
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
          'flex items-center justify-between text-mono-xs text-default bg-default',
          className
        )}
      >
        <span className="flex-inline flex-grow text-tertiary">
          rows per page <PageInput number={pageSize} />
        </span>
        {(hasNext || hasPrev) && (
          <span className="flex space-x-2">
            <button
              className={cn(!hasPrev && 'text-secondary', 'flex items-center text-mono-xs')}
              disabled={!hasPrev}
              onClick={onPrev}
            >
              <DirectionLeftIcon
                className={cn('mr-0.5', hasPrev ? 'text-default' : 'text-quaternary')}
              />
              prev
            </button>
            <button
              className={cn(!hasNext && 'text-secondary', 'flex items-center text-mono-xs')}
              disabled={!hasNext}
              // nextPage will be defined if hasNext is true
              onClick={onNext.bind(null, nextPage!)}
            >
              next
              <DirectionRightIcon
                className={cn('ml-0.5', hasNext ? 'text-default' : 'text-quaternary')}
              />
            </button>
          </span>
        )}
      </div>
    </>
  )
}
