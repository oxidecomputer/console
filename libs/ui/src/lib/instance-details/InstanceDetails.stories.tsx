import React from 'react'
import { InstanceDetails } from './InstanceDetails'

export default {
  component: InstanceDetails,
  title: 'Components/Instance Details',
}

export const primary = () => {
  return (
    <InstanceDetails
      cpu="2"
      memory="8 GB"
      storage="100 GB"
      vm={{ os: 'Debian', version: '9.12', arch: 'x64' }}
      hostname="db1.useast1.inst"
      ip="10.10.16.7"
    />
  )
}
