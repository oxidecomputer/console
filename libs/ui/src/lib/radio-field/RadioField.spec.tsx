import React from 'react'
import { render } from '../../test-utils'

import { RadioField } from './RadioField'

describe('RadioField', () => {
  it('should render successfully', () => {
    const { container } = render(<RadioField value="example" />)
    expect(container).toBeTruthy()
  })
})
