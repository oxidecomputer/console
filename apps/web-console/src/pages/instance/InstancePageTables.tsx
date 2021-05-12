import React from 'react'
import 'twin.macro'

import { Button, Table, Icon } from '@oxide/ui'

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
          <span tw="text-sm">{entry.name}</span>
          <span tw="text-xxs text-gray-400">{entry.image}</span>
        </>
      ),
      size: entry.size,
      mode: <span tw="text-sm">{entry.mode}</span>,
      actions: (
        <Button size="sm" variant="ghost" tw="w-full">
          <Icon name="more" />
        </Button>
      ),
    }
  })
  const formatPackagesData = packagesData.map((entry) => {
    return {
      name: (
        <>
          <span tw="text-sm">{entry.name}</span>
          <span tw="text-xxs text-gray-400">{entry.version}</span>
        </>
      ),
      upstream: entry.upstream,
      cve: <span tw="text-sm">{entry.cve}</span>,
      actions: (
        <Button size="sm" variant="ghost" tw="w-full">
          <Icon name="more" />
        </Button>
      ),
    }
  })
  return (
    <>
      <span tw="text-gray-50 mt-8">Attached Disks</span>
      <div tw="mt-3 h-44">
        <Table
          itemSize={() => 44}
          columns={[
            { Header: 'Name/Image', accessor: 'name', arrange: 'fill' },
            { Header: 'Size (GB)', accessor: 'size' },
            { Header: 'Mode', accessor: 'mode' },
            { Header: '', accessor: 'actions', width: 12 },
          ]}
          data={formatDiskData}
        />
      </div>
      <span tw="text-gray-50 mt-8">Package Updates</span>
      <div tw="mt-3 h-44">
        <Table
          itemSize={() => 44}
          columns={[
            { Header: 'Name/Version', accessor: 'name', arrange: 'fill' },
            { Header: 'Upstream', accessor: 'upstream' },
            { Header: 'CVE', accessor: 'cve' },
            { Header: '', accessor: 'actions', width: 12 },
          ]}
          data={formatPackagesData}
        />
      </div>
    </>
  )
}
