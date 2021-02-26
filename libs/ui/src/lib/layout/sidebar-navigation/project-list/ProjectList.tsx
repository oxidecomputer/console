import React, { FC } from 'react'

import styled from 'styled-components'
import { Project } from '@oxide/backend-types'

import { Text } from '../../../text/Text'
import { Icon } from '../../../icon/Icon'

export interface ProjectListProps {
  projects: Project[]
}

const StyledProjectList = styled(Text).attrs({
  size: 'xs',
  font: 'mono',
  weight: 400,
})`
  ${({ theme }) => theme.spaceBetweenY(3)}
`

const Header = styled(Text).attrs({ as: 'header' })`
  color: ${({ theme }) => theme.themeColors.green500};
  text-transform: uppercase;
`

const Count = styled(Text)`
  color: ${({ theme }) => theme.themeColors.green300};
`

const List = styled.ul`
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;

  align-items: flex-start;
  justify-content: center;

  color: ${({ theme }) => theme.themeColors.gray400};
  text-transform: uppercase;

  ${({ theme }) => theme.spaceBetweenY(3)}
`

const ListItem = styled(Text).attrs({ as: 'li' })``

const Create = styled(Text).attrs({
  as: 'div',
  font: 'mono',
  weight: 400,
  size: 'xxs',
})`
  color: ${({ theme }) => theme.themeColors.gray400};
`

export const ProjectList: FC<ProjectListProps> = (props) => {
  return (
    <StyledProjectList>
      <Header>
        Projects <Count>{props.projects.length}</Count>
      </Header>
      <List>
        {props.projects.map((p) => (
          <ListItem key={p.id}>{p.name}</ListItem>
        ))}
      </List>
      <Create>
        Create a new project <Icon name="plus" color="gray400" />
      </Create>
    </StyledProjectList>
  )
}

export default ProjectList
