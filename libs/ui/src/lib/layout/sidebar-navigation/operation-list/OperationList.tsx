import React from 'react'

import styled, { css } from 'styled-components'

import { Text } from '../../../text/Text'
import { Icon } from '../../../icon/Icon'

const BaseText = styled(Text).attrs({
  size: 'xs',
  font: 'mono',
  weight: 400,
})``

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`

const HeaderText = styled(BaseText)`
  color: ${({ theme }) => theme.color('green500')};
`

const List = styled.ul`
  display: flex;
  flex-direction: column;

  color: ${({ theme }) => theme.color('gray400')};
  text-transform: uppercase;

  ${({ theme }) => theme.spaceBetweenY(1)}
  margin-top: ${({ theme }) => theme.spacing(1)};
`

const BaseLink = styled.a`
  color: ${({ theme }) => theme.color('gray400')} !important;
  padding: ${({ theme }) => theme.spacing(1)};

  :hover {
    background-color: ${({ theme }) => theme.color('gray700')};
  }

  :focus {
    outline: 1px solid ${({ theme }) => theme.color('blue500')};
  }
`

const ListItemLink = styled(BaseLink)`
  display: flex;
  ${({ theme }) => theme.spaceBetweenX(2)}
`

const glyphWidth = '1rem'

const ListSubItem = styled.li`
  margin-left: 1.75rem;

  ::before {
    content: '├';
    color: ${({ theme }) => theme.color('yellow500')};
    width: ${glyphWidth};
    display: inline-block;
  }

  :last-child::before {
    content: '└';
  }
`

const SubItemLink = styled(BaseLink)`
  width: calc(100% - ${glyphWidth});
  display: inline-block;
`

const Title = styled(BaseText)<{ selected?: boolean }>`
  ${({ selected, theme }) =>
    selected &&
    css`
      color: ${theme.color('gray50')};
    `}
`

const SubItemTitle = styled(Title).attrs({
  size: 'xxs',
})``

export const OperationList = () => {
  return (
    <nav>
      <Header>
        <HeaderText>Operations</HeaderText>
      </Header>
      <List>
        <li>
          <ListItemLink href="#">
            <Icon name="dashboard" />
            <Title>System</Title>
          </ListItemLink>
        </li>

        <li>
          <ListItemLink href="#">
            <Icon name="resources" />
            <Title selected={true}>Resources</Title>
          </ListItemLink>
          <List>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>Instances</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>VPCs</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle selected={true}>Images</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>Disks</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>Snapshots</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>Firewall Rules</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
            <ListSubItem>
              <SubItemLink href="#">
                <SubItemTitle>IP Addresses</SubItemTitle>
              </SubItemLink>
            </ListSubItem>
          </List>
        </li>

        <li>
          <ListItemLink href="#">
            <Icon name="organization" />
            <Title>Organizations</Title>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <Icon name="projects" />
            <Title>Projects</Title>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <Icon name="users" />
            <Title>IAM</Title>
          </ListItemLink>
        </li>
      </List>
    </nav>
  )
}
