import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import { Link, NavLink } from 'react-router-dom'

import type { ApiProjectView } from '@oxide/api'
import { defaultTheme as theme } from '@oxide/theme'

import { Text } from '../../../text/Text'
import type { TextProps } from '../../../text/Text'
import { TextWithIcon } from '../../../text-with-icon/TextWithIcon'

export interface ProjectListProps {
  /** The list of projects to display in the list */
  projects: ApiProjectView[]
}

const baseTextProps: Partial<TextProps> = {
  size: 'sm',
}

const StyledProjectList = styled.div`
  ${({ theme }) => theme.spaceBetweenY(1)}
`

const Row = styled.section`
  padding: ${({ theme }) => theme.spacing(1)};
`

const Header = styled(Row).attrs({ as: 'header' })`
  text-transform: uppercase;
  ${({ theme }) => theme.spaceBetweenX(2)}
`

const HeaderText = styled(Text).attrs(baseTextProps)`
  color: ${({ theme }) => theme.color('green500')};
`

const Count = styled(Text).attrs(baseTextProps)`
  color: ${({ theme }) => theme.color('green300')};
`

const List = styled.ul`
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;

  align-items: flex-start;
  justify-content: center;

  text-transform: uppercase;

  ${({ theme }) => theme.spaceBetweenY(1)}
`

const ListItem = styled(Row).attrs({ as: 'li' })`
  padding: 0;
  width: 100%;

  :hover {
    background-color: ${({ theme }) => theme.color('gray700')};
  }

  :focus {
    outline: 1px solid ${({ theme }) => theme.color('blue500')};
  }
`

const StyledLink = styled(NavLink)`
  color: ${({ theme }) => theme.color('gray400')};
  display: inline-flex;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`

const activeLink = {
  color: theme.color('gray50'),
}

const Create = styled(Row).attrs({ as: 'footer' })`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  cursor: pointer;

  ${({ theme }) => theme.spaceBetweenX(1)}
`

const CreateText = styled(TextWithIcon).attrs({
  align: 'right',
  icon: { name: 'plus', color: 'gray400' },
  text: { color: 'gray400', size: 'xxs' },
})``

export const ProjectList: FC<ProjectListProps> = (props) => {
  return (
    <StyledProjectList>
      <Header>
        <HeaderText>Projects</HeaderText>
        <Count>{props.projects.length}</Count>
      </Header>
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
        <Link to="/projects-new">
          <CreateText>Create a new project</CreateText>
        </Link>
      </Create>
    </StyledProjectList>
  )
}
