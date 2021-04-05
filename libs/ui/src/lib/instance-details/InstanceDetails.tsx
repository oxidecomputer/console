import React from 'react'

import styled from 'styled-components'
import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'
import { Badge } from '../badge/Badge'

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

const StyledIcon = styled(Icon)`
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(3)};
`

const StyledBadge = styled(Badge)`
  margin-right: ${({ theme }) => theme.spacing(3)};
`

export const InstanceDetails = (props: InstanceDetailsProps) => {
  return (
    <Text size="sm">
      <StyledBadge title="running" variant="notification" color="green" />
      <span>
        <Cell>{props.cpu} vCPU</Cell>
        <Cell>{props.memory} RAM</Cell>
        <Cell style={{ textTransform: 'uppercase' }}>{props.storage} Disk</Cell>
        <Cell>
          {props.vm.os} {props.vm.version} {props.vm.arch}
        </Cell>
        <Cell>
          {props.hostname}
          <StyledIcon name="copy" />
          {props.ip}
        </Cell>
      </span>
    </Text>
  )
}
