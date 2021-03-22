import React from 'react'

import tw, { styled } from 'twin.macro'

import { Icon } from '../../../icon/Icon'

const List = tw.ul`flex flex-col text-gray-400 uppercase space-y-1 mt-1`

const BaseLink = tw.a`text-gray-400! p-1 hover:bg-gray-700 focus:outline-blue`

const ListItemLink = styled(BaseLink)`
  ${tw`flex space-x-2`}
`

const glyphWidth = '1rem'

const ListSubItem = styled.li`
  ${tw`ml-7`}

  ::before {
    content: '├';
    width: ${glyphWidth};
    display: inline-block;
    ${tw`text-yellow-500 text-base w-4`}
  }

  :last-child::before {
    content: '└';
  }
`

const SubItemLink = styled(BaseLink)`
  width: calc(100% - ${glyphWidth});
  display: inline-block;
`

const Title = styled.span<{ selected?: boolean }>(({ selected }) => [
  selected && tw`text-primary`,
])

const SubItemTitle = styled(Title).attrs({ size: 'xxs' })``

export const OperationList = () => {
  return (
    <nav tw="text-xs font-mono">
      <header tw="p-1 uppercase text-secondary">Operations</header>
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

export default OperationList
