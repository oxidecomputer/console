import React from 'react'
import { render } from '../../test-utils'

import { InstanceDetails } from './InstanceDetails'

describe('InstanceDetails', () => {
  it('should render successfully', () => {
    const { container } = render(
      <InstanceDetails
        cpu="2"
        memory="8 GB"
        storage="100 GB"
        vm={{ os: 'Debian', version: '9.12', arch: 'x64' }}
        hostname="db1.useast1.inst"
        ip="10.10.16.7"
      />
    )
    expect(container).toBeTruthy()
  })
})
