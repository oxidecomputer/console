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
  margin-right: ${({ theme }) => theme.spacing(2.5)};
  :last-of-type {
    margin-right: 0;
  }
  :first-of-type:before {
    content: ' // ';
    padding-right: ${({ theme }) => theme.spacing(2.5)};
  }
  }
`

const ResourceCell = styled.span`
  :before {
    content: ' // ';
  }
  :first-child:before {
    content: '';
  }
`

const IconRight = styled(Icon)`
  margin-left: ${({ theme }) => theme.spacing(1)};
`

const Wrapper = styled(Text).attrs({ size: 'sm', as: 'div' })`
  ${({ theme }) => theme.spaceBetweenX(3)}
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
      <span>
        <Cell>
          {props.vm.os}
        </Cell>
        <Cell>
          {props.vm.version} {props.vm.arch}
        </Cell>
      </span>
      <span>
        <Cell>
          {props.hostname}
          <IconRight name="copy" />
        </Cell>
        <Cell>{props.ip}</Cell>
      </span>
    </Wrapper>
  )
}
