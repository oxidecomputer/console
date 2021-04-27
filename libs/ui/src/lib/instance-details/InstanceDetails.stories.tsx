import React from 'react'

import { InstanceDetails } from './InstanceDetails'
import { instance } from '@oxide/api-mocks'

export default {
  component: InstanceDetails,
  title: 'Components/Instance Details',
}

export const primary = () => {
  return <InstanceDetails instance={instance} />
}
