import React, { FC } from 'react'
import { render } from '../../test-utils'

import Tabs from './Tabs'

describe('Tabs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tabs />)
    expect(baseElement).toBeTruthy()
  })
})
