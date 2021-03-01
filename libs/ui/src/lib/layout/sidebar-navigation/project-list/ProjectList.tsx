import React, { FC } from 'react'

import styled from 'styled-components'
import { Project } from '@oxide/backend-types'

import { Text } from '../../../text/Text'
import { Icon } from '../../../icon/Icon'

export interface ProjectListProps {
  projects: Project[]
}

const BaseText = styled(Text).attrs({
  size: 'xs',
  font: 'mono',
  weight: 400,
})``

const StyledProjectList = styled.div`
  ${({ theme }) => theme.spaceBetweenY(3)}
`

const Header = styled.header`
  text-transform: uppercase;
`

const HeaderText = styled(BaseText)`
  color: ${({ theme }) => theme.themeColors.green500};
`

const Count = styled(BaseText)`
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

const ListItem = styled(BaseText).attrs({ as: 'li' })``

const Create = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  ${({ theme }) => theme.spaceBetweenX(1)}
`

const CreateText = styled(BaseText).attrs({
  size: 'xxs',
})`
  color: ${({ theme }) => theme.themeColors.gray400};
`

const CreateIcon = styled(Icon).attrs({ color: 'gray400', name: 'plus' })`
  width: ${({ theme }) => theme.spacing(2.5)};
`

export const ProjectList: FC<ProjectListProps> = (props) => {
  return (
    <StyledProjectList>
      <Header>
        <HeaderText>Projects </HeaderText>
        <Count>{props.projects.length}</Count>
      </Header>
      <List>
        {props.projects.map((p) => (
          <ListItem key={p.id}>{p.name}</ListItem>
        ))}
      </List>
      <Create>
        <CreateText>Create a new project</CreateText>
        <CreateIcon />
      </Create>
    </StyledProjectList>
  )
}

export default ProjectList
