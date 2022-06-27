import { Menu, MenuButton, MenuLink, MenuList } from '@reach/menu-button'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SelectArrows6Icon } from '@oxide/ui'

import { useParams } from 'app/hooks'

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

export const ProjectSelector = () => {
  const { orgName, projectName } = useParams('orgName')

  const { data } = useApiQuery('organizationProjectsGet', { orgName, limit: 20 })

  // filter out current project if there is one. if there isn't one, it'll be
  // undefined and it won't match any
  const projects = (data?.items || []).filter((p) => p.name !== projectName)

  return (
    <Menu>
      <MenuButton
        aria-label="Switch project"
        className="mt-1 flex items-center justify-between w-full"
      >
        <div className="flex items-center">
          <BrandIcon />
          <div className="ml-2 pb-0.5 leading-4 text-sans-sm text-left">
            <div>{orgName}</div>
            <div className="text-secondary">{projectName || 'select a project'}</div>
          </div>
        </div>
        {/* aria-hidden is a tip from the Reach docs */}
        <SelectArrows6Icon className="text-secondary" aria-hidden />
      </MenuButton>
      <MenuList className="w-48 mt-2">
        {projects.map((project) => (
          <MenuLink
            key={project.name}
            as={Link}
            to={`/orgs/${orgName}/projects/${project.name}`}
          >
            {project.name}
          </MenuLink>
        ))}
      </MenuList>
    </Menu>
  )
}
