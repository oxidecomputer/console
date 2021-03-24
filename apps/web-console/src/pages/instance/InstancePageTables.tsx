import React from 'react'

import styled from 'styled-components'

import { Button, Table, Icon, Text } from '@oxide/ui'

const TableWrapper = styled.div`
  height: 176px;
  margin-top: ${({ theme }) => theme.spacing(3)};
`

const StyledTable = styled(Table)``

const StyledText = styled(Text).attrs({
  color: 'gray50',
  as: 'div',
})`
  margin-top: ${({ theme }) => theme.spacing(8)};
`

const StyledButton = styled(Button).attrs({
  size: 'sm',
  variant: 'ghost',
})`
  width: 100%;
`

const DISKS_SAMPLE_DATA = [
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

const PACKAGES_SAMPLE_DATA = [
  {
    name: 'dhsutil',
    version: '12.0.1',
    upstream: '15.0.1',
    cve: 'CVE-2009-0021',
  },
  {
    name: 'systemd',
    version: '14.0.1',
    upstream: '14.2.1',
    cve: 'CVE-2009-0022',
  },
  {
    name: 'docker',
    version: '16.2.1',
    upstream: '18.2.1',
    cve: 'CVE-2009-0023',
  },
]

export const InstancePageTables = ({
  diskData = DISKS_SAMPLE_DATA,
  packagesData = PACKAGES_SAMPLE_DATA,
}) => {
  const formatDiskData = diskData.map((entry) => {
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
  const formatPackagesData = packagesData.map((entry) => {
    return {
      name: (
        <>
          <Text size="sm">{entry.name}</Text>
          <Text size="xxs" color="gray400">
            {entry.version}
          </Text>
        </>
      ),
      upstream: entry.upstream,
      cve: <Text size="sm">{entry.cve}</Text>,
      actions: (
        <StyledButton>
          <Icon name="more" />
        </StyledButton>
      ),
    }
  })
  return (
    <>
      <StyledText>Attached Disks</StyledText>
      <TableWrapper>
        <StyledTable
          itemSize={() => 44}
          columns={[
            { Header: 'Name/Image', accessor: 'name', arrange: 'fill' },
            { Header: 'Size (GB)', accessor: 'size' },
            { Header: 'Mode', accessor: 'mode' },
            { Header: '', accessor: 'actions', width: 12 },
          ]}
          data={formatDiskData}
        />
      </TableWrapper>
      <StyledText>Package Updates</StyledText>
      <TableWrapper>
        <StyledTable
          itemSize={() => 44}
          columns={[
            { Header: 'Name/Version', accessor: 'name', arrange: 'fill' },
            { Header: 'Upstream', accessor: 'upstream' },
            { Header: 'CVE', accessor: 'cve' },
            { Header: '', accessor: 'actions', width: 12 },
          ]}
          data={formatPackagesData}
        />
      </TableWrapper>
    </>
  )
}
