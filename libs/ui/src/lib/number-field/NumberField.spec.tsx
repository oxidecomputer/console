import React from 'react'
import { render } from '../../test-utils'

import { NumberField } from './NumberField'

describe('NumberField', () => {
  it('should render successfully', () => {
    const { container } = render(<NumberField />)
    expect(container).toBeTruthy()
  })
})
