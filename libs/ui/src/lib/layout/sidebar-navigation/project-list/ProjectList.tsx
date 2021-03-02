import React, { FC } from 'react'

import styled, { css } from 'styled-components'
import { Project, ProjectId } from '@oxide/backend-types'

import { Text } from '../../../text/Text'
import { Icon } from '../../../icon/Icon'
import NotificationCount from './notification-count/NotificationCount'

export interface ProjectListProps {
  projects: Project[]

  selectedProjectId?: ProjectId
}

const BaseText = styled(Text).attrs({
  size: 'xs',
  font: 'mono',
  weight: 400,
})``

const Section = styled.section`
  ${({ theme }) => theme.paddingX(1)}
`

const StyledProjectList = styled.div`
  ${({ theme }) => theme.spaceBetweenY(3)}
`

const Header = styled(Section).attrs({ as: 'header' })`
  text-transform: uppercase;
`

const HeaderText = styled(BaseText)`
  color: ${({ theme }) => theme.themeColors.green500};
`

const Count = styled(BaseText)`
  color: ${({ theme }) => theme.themeColors.green300};
`

const List = styled(Section).attrs({ as: 'ul' })`
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;

  align-items: flex-start;
  justify-content: center;

  color: ${({ theme }) => theme.themeColors.gray400};
  text-transform: uppercase;

  ${({ theme }) => theme.spaceBetweenY(1)}
`

const ListItem = styled.li`
  width: 100%;

  padding: ${({ theme }) => theme.spacing(1)};

  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.spaceBetweenX(1)}

  &:hover {
    background-color: ${({ theme }) => theme.themeColors.gray700};
  }
`

const Title = styled(BaseText)<{ selected?: boolean }>`
  flex: 1;

  ${({ selected, theme }) =>
    selected &&
    css`
      color: ${theme.themeColors.gray50};
    `}
`

const BookmarkIcon = styled(Icon).attrs({
  color: 'yellow500',
  name: 'bookmark',
})``

const Create = styled(Section)`
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
          <ListItem key={p.id}>
            <Title selected={p.id === props.selectedProjectId}>{p.name}</Title>
            {p.notifications && <NotificationCount count={p.notifications} />}
            {p.starred && <BookmarkIcon />}
          </ListItem>
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
