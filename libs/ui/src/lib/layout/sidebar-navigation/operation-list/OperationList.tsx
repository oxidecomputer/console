import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'

import { Text } from '../../../text/Text'
import { TextWithIcon } from '../../../text-with-icon/TextWithIcon'

const BaseText = styled(Text).attrs({ size: 'sm' })``

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
  color: ${({ theme }) => theme.color('gray400')};
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

const TitleWithIcon = styled(TextWithIcon).attrs({
  text: { size: 'xs' },
})<{ selected?: boolean }>`
  ${({ selected, theme }) =>
    selected &&
    css`
      color: ${theme.color('gray50')};
    `}
`

const SubItemTitle = styled(BaseText).attrs({
  size: 'xxs',
})<{ selected?: boolean }>`
  ${({ selected, theme }) =>
    selected &&
    css`
      color: ${theme.color('gray50')};
    `}
`

export interface OperationListProps {
  className?: string
}

export const OperationList: FC<OperationListProps> = ({ className }) => {
  return (
    <nav className={className}>
      <Header>
        <HeaderText>Operations</HeaderText>
      </Header>
      <List>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon icon={{ name: 'dashboard' }}>System</TitleWithIcon>
          </ListItemLink>
        </li>

        <li>
          <ListItemLink href="#">
            <TitleWithIcon icon={{ name: 'resources' }} selected={true}>
              Resources
            </TitleWithIcon>
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
            <TitleWithIcon icon={{ name: 'organization' }}>
              Organizations
            </TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon icon={{ name: 'projects' }}>Projects</TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon icon={{ name: 'users' }}>IAM</TitleWithIcon>
          </ListItemLink>
        </li>
      </List>
    </nav>
  )
}
