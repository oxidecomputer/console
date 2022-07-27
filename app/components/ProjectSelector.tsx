import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from '@reach/menu-button'
import { Link } from 'react-router-dom'

import { useApiQuery } from '@oxide/api'
import { SelectArrows6Icon } from '@oxide/ui'

import { useAllParams } from 'app/hooks'

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
  const { orgName, projectName } = useAllParams('orgName')

  const { data } = useApiQuery('projectList', { orgName, limit: 20 })

  // filter out current project if there is one. if there isn't one, it'll be
  // undefined and it won't match any
  const projects = (data?.items || []).filter((p) => p.name !== projectName)

  return (
    <Menu>
      <MenuButton
        aria-label="Switch project"
        className="mt-1 flex items-center justify-between w-full group"
      >
        <div className="flex items-center">
          <BrandIcon />
          <div className="ml-2 pb-0.5 leading-4 text-sans-sm text-left">
            <div>{orgName}</div>
            <div className="text-secondary w-[140px] text-ellipsis whitespace-nowrap overflow-hidden">
              {projectName || 'select a project'}
            </div>
          </div>
        </div>
        {/* aria-hidden is a tip from the Reach docs */}
        <div className="flex flex-shrink-0 w-[1.125rem] h-[1.625rem] rounded border border-secondary justify-center items-center group-hover:bg-hover">
          <SelectArrows6Icon className="text-secondary" aria-hidden />
        </div>
      </MenuButton>
      <MenuList className="mt-2">
        {projects.length > 0 ? (
          projects.map((project) => (
            <MenuLink
              key={project.name}
              as={Link}
              to={`/orgs/${orgName}/projects/${project.name}`}
            >
              {project.name}
            </MenuLink>
          ))
        ) : (
          <MenuItem
            className="!text-center hover:cursor-default !pr-3 !text-secondary"
            onSelect={() => {}}
            disabled
          >
            No other projects found
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}
