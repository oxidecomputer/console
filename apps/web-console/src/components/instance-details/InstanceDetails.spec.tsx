import React from 'react'
import { render } from '../../test-utils'

import { InstanceDetails } from './InstanceDetails'

import { instance } from '@oxide/api-mocks'

describe('InstanceDetails', () => {
  it('should render successfully', () => {
    const { getByText } = render(<InstanceDetails instance={instance} />)
    expect(getByText('7 vCPU')).toBeTruthy()
    expect(getByText('256 MB RAM')).toBeTruthy()
    expect(getByText('running')).toBeTruthy()
  })
})
