import React from 'react'
import tw, { styled } from 'twin.macro'

import { Icon } from '@oxide/ui'
import { color, spacing } from '@oxide/css-helpers'

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

const TitleWithIcon = styled.span<{ selected?: boolean }>(() => [
  tw`text-xs inline-flex`,
  ({ selected }) => selected && tw`text-gray-50`,
])

const SubItemTitle = tw.span`text-xxs`

export interface OperationListProps {
  className?: string
}

export const OperationList = ({ className }: OperationListProps) => {
  return (
    <nav className={className}>
      <header tw="p-1 uppercase text-sm text-green-500">Operations</header>
      <List>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="dashboard" tw="mr-2" />
              System
            </TitleWithIcon>
          </ListItemLink>
        </li>

        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="resources" tw="mr-2" />
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
              <Icon name="organization" tw="mr-2" />
              Organizations
            </TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="projects" tw="mr-2" />
              Projects
            </TitleWithIcon>
          </ListItemLink>
        </li>
        <li>
          <ListItemLink href="#">
            <TitleWithIcon>
              <Icon name="users" tw="mr-2" /> IAM
            </TitleWithIcon>
          </ListItemLink>
        </li>
      </List>
    </nav>
  )
}
