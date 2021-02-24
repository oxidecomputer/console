import React from 'react'
import { render } from '../../test-utils'

import Avatar from './Avatar'

describe('Avatar', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Avatar name="Cameron Howe" />)
    expect(baseElement).toBeTruthy()
  })
})
