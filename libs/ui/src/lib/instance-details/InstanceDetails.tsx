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
  margin-left: ${({ theme }) => theme.spacing(2)};
`

const Wrapper = styled(Text).attrs({ font: 'mono' })`
  ${({ theme }) => theme.spaceBetweenX(4)}
`

export const InstanceDetails = (props: InstanceDetailsProps) => {
  return (
    <Wrapper>
      <Text color="green500">BADGE PLACEHOLDER</Text>
      <span>
        <Cell>{props.cpu} vCPU</Cell>
        <Cell>{props.memory} RAM</Cell>
        <Cell style={{ textTransform: 'uppercase' }}>{props.storage} Disk</Cell>
      </span>
      <span>
        {props.vm.os}
        {/* placeholder for OS-specific icon */}
        <IconMiddle name="warning" />
        {props.vm.version} {props.vm.arch}
      </span>
      <span>
        {props.hostname}
        {/* placeholder for copy icon */}
        <IconRight name="warning" />
      </span>
      <span>{props.ip}</span>
    </Wrapper>
  )
}
