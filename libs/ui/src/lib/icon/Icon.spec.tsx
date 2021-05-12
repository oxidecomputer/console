import React from 'react'
import { render } from '../../test-utils'

import { Icon } from './Icon'

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon name="bookmark" />)
    expect(baseElement).toBeTruthy()
  })
})
