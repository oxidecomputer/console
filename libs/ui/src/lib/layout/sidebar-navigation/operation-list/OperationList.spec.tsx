import React, { FC } from 'react'
import { render } from '../../../test-utils'

import OperationList from './OperationList'

describe('OperationList', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OperationList />)
    expect(baseElement).toBeTruthy()
  })
})
