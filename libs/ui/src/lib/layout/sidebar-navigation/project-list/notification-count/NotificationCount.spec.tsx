import React from 'react'
import { render } from '../../../../../test-utils'

import NotificationCount from './NotificationCount'

describe('NotificationCount', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NotificationCount count={1} />)
    expect(baseElement).toBeTruthy()
  })
})
