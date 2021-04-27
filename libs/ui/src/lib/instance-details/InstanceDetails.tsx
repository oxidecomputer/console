import React from 'react'
import styled from 'styled-components'
import filesize from 'filesize'

import type { ApiInstanceView } from '@oxide/api'
import { Text } from '../text/Text'
import { Icon } from '../icon/Icon'
import { Badge } from '../badge/Badge'

export interface InstanceDetailsProps {
  instance: ApiInstanceView
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

export const InstanceDetails = ({ instance }: InstanceDetailsProps) => {
  return (
    <Text size="sm">
      <StyledBadge variant="notification" color="green">
        {instance.runState}
      </StyledBadge>
      <span>
        <Cell>{instance.ncpus} vCPU</Cell>
        <Cell>{filesize(instance.memory)} RAM</Cell>
        <Cell style={{ textTransform: 'uppercase' }}>100 GB Disk</Cell>
        <Cell>Debian 9.12 x64</Cell>
        <Cell>
          {instance.hostname}
          <StyledIcon name="copy" />
          10.10.16.7
        </Cell>
      </span>
    </Text>
  )
}
