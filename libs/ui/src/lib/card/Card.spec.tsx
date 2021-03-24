import React from 'react'
import { render } from '../../test-utils'

import { Card } from './Card'

describe('Card', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Card title="Text" subtitle="Something" />)
    expect(baseElement).toBeTruthy()
  })
})
