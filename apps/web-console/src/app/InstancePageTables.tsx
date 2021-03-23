import React from 'react'

import styled from 'styled-components'

import { Button, Table, Icon, Text } from '@oxide/ui'

export const InstancePageTables = () => {
  return (
    <div style={{ height: '50vh' }}>
      <Text>Attached Disks</Text>
      <Table
        columns={[
          { Header: 'Name/Image', accessor: 'name' },
          { Header: 'Size (GB)', accessor: 'size' },
          { Header: 'Mode', accessor: 'mode' },
          { Header: '', accessor: 'actions' },
        ]}
        data={[
          {
            name: 'ngix Unbuntu 18.84',
            size: 20,
            mode: 'boot, read/write',
            actions: (
              <Button>
                <Icon name="more" />
              </Button>
            ),
          },
          {
            name: 'grafana Unbuntu 18.84',
            size: 20,
            mode: 'read/write',
            actions: (
              <Button>
                <Icon name="more" />
              </Button>
            ),
          },
          {
            name: 'grafana-state Unbuntu 18.84',
            size: 20,
            mode: 'read/write',
            actions: (
              <Button>
                <Icon name="more" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
