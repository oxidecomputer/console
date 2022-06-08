import cn from 'classnames'
import { useParams as useRRParams } from 'react-router-dom'

import { SelectArrows6Icon } from '@oxide/ui'

/**
 * This is mostly temporary until we figure out the proper thing to go here
 */
const BrandIcon = () => (
  <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="2" fill="var(--base-grey-800)" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 4H4V10V28H10V10H22V28H28V4H24H22H10ZM13 13H19V28H13V13Z"
      fill="var(--base-black-700)"
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
          <div className="text-secondary">{projectName || 'select a project'}</div>
        </div>
      </div>
      <SelectArrows6Icon className="text-secondary" />
    </div>
  )
}
