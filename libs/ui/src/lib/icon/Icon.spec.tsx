import React from 'react'
import { render } from '../../test-utils'

import Icon from './Icon'

describe('Icon', () => {
  it('should render successfully', () => {
    // See: https://github.com/nrwl/nx/issues/4565
    const { baseElement } = render(<Icon name="bookmark" />)
    expect(baseElement).toBeTruthy()
  })
})
