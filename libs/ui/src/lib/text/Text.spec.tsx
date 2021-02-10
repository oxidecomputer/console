import React from 'react'
import { render } from '../../test-utils'

import Text from './Text'

describe('Text', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Text />)
    expect(baseElement).toBeTruthy()
  })
})
