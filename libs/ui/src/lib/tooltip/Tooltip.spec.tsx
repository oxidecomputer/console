import React from 'react'
import { render } from '../../test-utils'

import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('should render successfully', () => {
    const { container } = render(
      <Tooltip isPrimaryLabel={false} content="Example message" />
    )
    expect(container).toBeTruthy()
  })
})
