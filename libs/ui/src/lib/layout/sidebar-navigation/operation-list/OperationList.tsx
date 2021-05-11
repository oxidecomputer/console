import React from 'react'

import tw, { styled } from 'twin.macro'

import { Icon } from '../../../icon/Icon'
import { TextWithIcon } from '../../../text-with-icon/TextWithIcon'
import { color, spacing } from '@oxide/css-helpers'

const Header = styled.header`
  padding: ${spacing(1)};
  text-transform: uppercase;
`

const HeaderText = tw.span`text-sm text-green-500`

const List = tw.ul`flex flex-col text-gray-400 uppercase space-y-1 mt-1`

const BaseLink = styled.a`
  color: ${color('gray400')};
  padding: ${spacing(1)};

  :hover {
    background-color: ${color('gray700')};
  }
`

const ListItemLink = tw(BaseLink)`flex space-x-2`

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

const TitleWithIcon = styled(TextWithIcon)<{ selected?: boolean }>(() => [
  tw`text-xs`,
  ({ selected }) => selected && tw`text-gray-50`,
])

const SubItemTitle = tw.span`text-xxs`

export interface OperationListProps {
  className?: string
}

export const OperationList = ({ className }: OperationListProps) => {
  return (
    <nav className={className}>
      <Header>
        <HeaderText>Operations</HeaderText>
      </Header>
      <List>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="dashboard" />
              System
            </TitleWithIcon>
          </ListItemLink>
        </li>

        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="resources" />
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
                <SubItemTitle>Images</SubItemTitle>
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
            <TitleWithIcon>
              <Icon name="organization" />
              Organizations
            </TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="projects" />
              Projects
            </TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="users" /> IAM
            </TitleWithIcon>
          </ListItemLink>
        </li>
      </List>
    </nav>
  )
}
