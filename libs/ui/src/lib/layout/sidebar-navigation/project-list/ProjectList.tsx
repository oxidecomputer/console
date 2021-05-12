import React from 'react'
import tw, { styled } from 'twin.macro'
import { Link, NavLink } from 'react-router-dom'

import type { ApiProjectView } from '@oxide/api'

import { Icon } from '../../../icon/Icon'
import { TextWithIcon } from '../../../text-with-icon/TextWithIcon'
import { color, spacing } from '@oxide/css-helpers'

export interface ProjectListProps {
  className?: string
  /** The list of projects to display in the list */
  projects: ApiProjectView[]
}

const List = styled.ul`
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;

  text-transform: uppercase;

  ${tw`space-y-1`}
`

const ListItem = styled.li`
  padding: 0;
  width: 100%;

  :hover {
    background-color: ${color('gray700')};
  }
`

const StyledLink = styled(NavLink)`
  color: ${color('gray400')};
  display: inline-flex;
  padding: ${spacing(1)};
  width: 100%;
`

const activeLink = {
  color: color('gray50'),
}

export const ProjectList = (props: ProjectListProps) => {
  return (
    <section tw="space-y-1" className={props.className}>
      <header tw="p-1 space-x-2 uppercase text-sm">
        <span tw="text-green-500">Projects</span>
        <span tw="text-green-300">{props.projects.length}</span>
      </header>
      <List>
        {props.projects.map((p) => (
          <ListItem tw="text-xs" key={p.id} tabIndex={0}>
            <StyledLink to={`/projects/${p.name}`} activeStyle={activeLink}>
              {p.name}
            </StyledLink>
          </ListItem>
        ))}
      </List>
      <footer tw="p-1 flex">
        <Link tw="text-xxs text-gray-400" to="/projects/new">
          <TextWithIcon tw="gap-1">
            Create a new project <Icon tw="text-sm" name="plus" />
          </TextWithIcon>
        </Link>
      </footer>
    </section>
  )
}
