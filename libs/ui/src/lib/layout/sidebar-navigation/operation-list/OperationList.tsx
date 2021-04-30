import type { FC } from 'react'
import React from 'react'

import styled, { css } from 'styled-components'

import { Text } from '../../../text/Text'
import { TextWithIcon } from '../../../text-with-icon/TextWithIcon'
import {
  color,
  spaceBetweenX,
  spaceBetweenY,
  spacing,
} from '@oxide/css-helpers'

const BaseText = styled(Text).attrs({ size: 'sm' })``

const Header = styled.header`
  padding: ${spacing(1)};
  text-transform: uppercase;
`

const HeaderText = styled(BaseText)`
  color: ${color('green500')};
`

const List = styled.ul`
  display: flex;
  flex-direction: column;

  color: ${color('gray400')};
  text-transform: uppercase;

  ${spaceBetweenY(1)}
  margin-top: ${spacing(1)};
`

const BaseLink = styled.a`
  color: ${color('gray400')};
  padding: ${spacing(1)};

  :hover {
    background-color: ${color('gray700')};
  }
`

const ListItemLink = styled(BaseLink)`
  display: flex;
  ${spaceBetweenX(2)}
`

const glyphWidth = '1rem'

const ListSubItem = styled.li`
  margin-left: 1.75rem;

  ::before {
    content: '├';
    color: ${color('yellow500')};
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
  ${({ selected }) =>
    selected &&
    css`
      color: ${color('gray50')};
    `}
`

const SubItemTitle = styled(BaseText).attrs({
  size: 'xxs',
})<{ selected?: boolean }>`
  ${({ selected }) =>
    selected &&
    css`
      color: ${color('gray50')};
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
