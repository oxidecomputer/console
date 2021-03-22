import React from 'react'
import { render } from '../../../test-utils'

import { TextWithIcon } from './TextWithIcon'

describe('TextWithIcon', () => {
  it('should render successfully', () => {
    const { container } = render(<TextWithIcon />)
    expect(container).toBeTruthy()
  })
})
