import React from 'react'
import { render } from '@testing-library/react'

import Icon from './Icon'

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon />)
    expect(baseElement).toBeTruthy()
  })
})
