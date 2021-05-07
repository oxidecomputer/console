import type { FC } from 'react'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { Link, NavLink } from 'react-router-dom'

import type { ApiProjectView } from '@oxide/api'

import { Text } from '../../../text/Text'
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

const Create = styled.footer`
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-start;
  align-items: center;

  cursor: pointer;

  ${tw`space-x-1`}
`

const CreateText = styled(TextWithIcon).attrs({
  align: 'right',
  icon: { name: 'plus', color: 'gray400' },
  text: { color: 'gray400', size: 'xxs' },
})``

export const ProjectList: FC<ProjectListProps> = (props) => {
  return (
    <section tw="space-y-1" className={props.className}>
      <header tw="p-1 space-x-2 uppercase text-sm">
        <span tw="text-green-500">Projects</span>
        <span tw="text-green-300">{props.projects.length}</span>
      </header>
      <List>
        {props.projects.map((p) => (
          <ListItem key={p.id} tabIndex={0}>
            <StyledLink to={`/projects/${p.name}`} activeStyle={activeLink}>
              <Text size="xs">{p.name}</Text>
            </StyledLink>
          </ListItem>
        ))}
      </List>
      <Create>
        <Link to="/projects/new">
          <CreateText>Create a new project</CreateText>
        </Link>
      </Create>
    </section>
  )
}
