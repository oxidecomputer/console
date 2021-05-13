import React from 'react'
import { render } from '../../test-utils'

import { Button } from './Button'

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Button size="base" variant="link">
        Button
      </Button>
    )
    expect(baseElement).toBeTruthy()
  })
})
