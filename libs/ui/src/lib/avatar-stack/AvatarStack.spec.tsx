import React from 'react'
import { render } from '../../test-utils'

import { AvatarStack } from './AvatarStack'

describe('AvatarStack', () => {
  it('should render successfully', () => {
    const { container } = render(<AvatarStack data={[]} />)
    expect(container).toBeTruthy()
  })
})
