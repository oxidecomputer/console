import React from 'react'

import styled from 'styled-components'
import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'

// TODO: a lot of these will be numbers in the PAI, and we will have a presentation
// layer that makes them human readable. since we don't know the format yet,
// assume they're strings
export interface InstanceDetailsProps {
  cpu: string
  memory: string
  storage: string
  vm: {
    os: string
    version: string
    arch: string
  }
  hostname: string
  ip: string
}

const Cell = styled.span`
  align-items: center;
  display: inline-flex;
`

const ResourceCell = styled.span`
  :before {
    content: ' // ';
  }
  :first-child:before {
    content: '';
  }
`

const IconMiddle = styled(Icon)`
  margin: 0 ${({ theme }) => theme.spacing(2)};
`

const IconRight = styled(Icon)`
  margin-left: ${({ theme }) => theme.spacing(1)};
`

const Wrapper = styled(Text).attrs({ font: 'mono', size: 'sm', as: 'div' })`
  ${({ theme }) => theme.spaceBetweenX(4)}
`

export const InstanceDetails = (props: InstanceDetailsProps) => {
  return (
    <Wrapper>
      {/* placeholder, waiting for badges */}
      <Text color="green500">[RUNNING]</Text>
      <span>
        <ResourceCell>{props.cpu} vCPU</ResourceCell>
        <ResourceCell>{props.memory} RAM</ResourceCell>
        <ResourceCell style={{ textTransform: 'uppercase' }}>
          {props.storage} Disk
        </ResourceCell>
      </span>
      <Cell>
        {props.vm.os}
        {/* placeholder for OS-specific icon */}
        <IconMiddle name="warning" />
        {props.vm.version} {props.vm.arch}
      </Cell>
      <Cell>
        {props.hostname}
        <IconRight name="copy" />
      </Cell>
      <Cell>{props.ip}</Cell>
    </Wrapper>
  )
}
