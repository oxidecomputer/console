import React from 'react'

import styled from 'styled-components'

import { Button, Table, Icon, Text } from '@oxide/ui'

const Wrapper = styled.div`
  height: 25vh;
`

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(4)};
`

const StyledButton = styled(Button).attrs({
  size: 'sm',
  variant: 'ghost',
})`
  width: 100%;
`

const SAMPLE_DATA = [
  {
    name: 'ngix',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'boot, read/write',
  },
  {
    name: 'grafana',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
  {
    name: 'grafana-state',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
  {
    name: 'ngix',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'boot, read/write',
  },
  {
    name: 'grafana',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
  {
    name: 'grafana-state',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
  {
    name: 'ngix',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'boot, read/write',
  },
  {
    name: 'grafana',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
  {
    name: 'grafana-state',
    image: 'Unbuntu 18.84',
    size: 20,
    mode: 'read/write',
  },
]

export const InstancePageTables = ({ data = SAMPLE_DATA }) => {
  const formatData = data.map((entry) => {
    return {
      name: (
        <>
          <Text size="sm">{entry.name}</Text>
          <Text size="xxs" color="gray400">
            {entry.image}
          </Text>
        </>
      ),
      size: entry.size,
      mode: <Text size="sm">{entry.mode}</Text>,
      actions: (
        <StyledButton>
          <Icon name="more" />
        </StyledButton>
      ),
    }
  })
  return (
    <Wrapper>
      <Text color="gray50">Attached Disks</Text>
      <StyledTable
        itemSize={() => 44}
        columns={[
          { Header: 'Name/Image', accessor: 'name', arrange: 'fill' },
          { Header: 'Size (GB)', accessor: 'size' },
          { Header: 'Mode', accessor: 'mode' },
          { Header: '', accessor: 'actions', width: 12 },
        ]}
        data={formatData}
      />
    </Wrapper>
  )
}
