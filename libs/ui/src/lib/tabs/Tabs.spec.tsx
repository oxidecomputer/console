import React, { FC } from 'react'
import { render } from '../../test-utils'

import Tabs from './Tabs'

describe('Tabs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Tabs
        label="Project View"
        tabs={['Overview', 'Metrics', 'Activity', 'Access & IAM', 'Settings']}
        panels={[
          <div key={1}>Overview panel</div>,
          <div key={2}>Metrics panel</div>,
          <div key={3}>Activity panel</div>,
          <div key={4}>Acess & IAM panel</div>,
          <div key={5}>Settings panel</div>,
        ]}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
