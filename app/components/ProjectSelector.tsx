import { SelectArrows6Icon } from '@oxide/ui'
import React from 'react'
import { useParams as useRRParams } from 'react-router-dom'
import cn from 'classnames'

/**
 * This is mostly temporary until we figure out the proper thing to go here
 */
const BrandIcon = () => (
  <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      width="32"
      height="32"
      rx="2"
      fill="var(--surface-accent-secondary)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.3 16.28v-1.16c0-3.75-1.58-6.18-4.73-6.18-3.14 0-4.73 2.43-4.73 6.18v1.16c0 3.75 1.59 6.19 4.73 6.19 3.15 0 4.73-2.44 4.73-6.19Zm-7.66 1.86a9.67 9.67 0 0 1-.16-1.86v-1.16c0-3.05 1.08-4.76 3.1-4.76 1.23 0 2.1.64 2.6 1.83l-5.54 5.95Zm5.9-4.68c.08.5.12 1.06.12 1.66v1.16c0 3.05-1.07 4.77-3.09 4.77a2.66 2.66 0 0 1-2.54-1.68l5.5-5.91Zm11.66-.61a.12.12 0 0 0-.16 0l-3.34 3.6-3.34-3.6a.12.12 0 0 0-.16 0l-.92.86c-.04.03-.04.1 0 .15l3.43 3.66-3.44 3.66c-.03.05-.03.12.01.16l.92.86c.04.03.12.03.16-.01l3.34-3.6 3.35 3.6c.04.04.1.04.16 0l.91-.85c.05-.04.05-.11 0-.16l-3.42-3.66 3.43-3.66c.03-.04.03-.12-.01-.15l-.92-.86Z"
      fill="var(--content-accent)"
    />
  </svg>
)

interface ProjectSelectorProps {
  className?: string
}
export const ProjectSelector = ({ className }: ProjectSelectorProps) => {
  const { orgName, projectName } = useRRParams()
  return (
    <div className={cn('mt-1 flex items-center justify-between', className)}>
      <div className="flex items-center">
        <BrandIcon />
        <div className="ml-2 pb-0.5 leading-4 text-sans-sm">
          <div>{orgName}</div>
          <div className="text-secondary">
            {projectName || 'select a project'}
          </div>
        </div>
      </div>
      <SelectArrows6Icon className="text-secondary" />
    </div>
  )
}
