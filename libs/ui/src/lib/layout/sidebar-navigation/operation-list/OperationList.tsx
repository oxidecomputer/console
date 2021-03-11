import React from 'react'

import styled, { css } from 'styled-components'

import { Text } from '../../../text/Text'
import { Icon } from '../../../icon/Icon'

const BaseText = styled(Text).attrs({
  size: 'xs',
  font: 'mono',
  weight: 400,
})``

const StyledOperationList = styled.div`
  ${({ theme }) => theme.spaceBetweenY(1)}
`

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`

const HeaderText = styled(BaseText)`
  color: ${({ theme }) => theme.color('green500')};
`

const List = styled.ul`
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;

  align-items: flex-start;
  justify-content: center;

  color: ${({ theme }) => theme.color('gray400')};
  text-transform: uppercase;

  ${({ theme }) => theme.spaceBetweenY(1)}
`

const ListItem = styled.li`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  padding: ${({ theme }) => theme.spacing(1)};

  display: flex;
  flex-direction: row;
  cursor: pointer;

  ${({ theme }) => theme.spaceBetweenX(1)}

  :hover {
    background-color: ${({ theme }) => theme.color('gray700')};
  }

  :focus {
    outline: 1px solid ${({ theme }) => theme.color('blue500')};
  }
`

const ListSubItem = styled(ListItem)`
  margin-left: 1.75rem;
`

const Title = styled(BaseText)<{ selected?: boolean }>`
  flex: 1;

  ${({ selected, theme }) =>
    selected &&
    css`
      color: ${theme.color('gray50')};
    `}
`

const StyledIcon = styled(Icon)`
  margin-right: 0.5rem;
`

const BoxGlyph = styled.span`
  margin-right: 0.25rem;
  color: ${({ theme }) => theme.color('yellow500')};
`

export const OperationList = () => {
  return (
    <StyledOperationList>
      <Header>
        <HeaderText>Operations</HeaderText>
      </Header>
      <List>
        <ListItem tabIndex={0}>
          <StyledIcon name="dashboard" />
          <Title>System</Title>
        </ListItem>

        <ListItem tabIndex={0}>
          <StyledIcon name="resources" />
          <Title selected={true}>Resources</Title>
        </ListItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title>Instances</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title>VPCs</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title selected={true}>Images</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title>Disks</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title>Snapshots</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>├</BoxGlyph>
          <Title>Firewall Rules</Title>
        </ListSubItem>
        <ListSubItem tabIndex={0}>
          <BoxGlyph>└</BoxGlyph>
          <Title>IP Addresses</Title>
        </ListSubItem>

        <ListItem tabIndex={0}>
          <StyledIcon name="organization" />
          <Title>Organizations</Title>
        </ListItem>
        <ListItem tabIndex={0}>
          <StyledIcon name="projects" />
          <Title>Projects</Title>
        </ListItem>
        <ListItem tabIndex={0}>
          <StyledIcon name="users" />
          <Title>IAM</Title>
        </ListItem>
      </List>
    </StyledOperationList>
  )
}

export default OperationList
