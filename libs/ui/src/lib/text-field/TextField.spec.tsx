import React, { FC } from 'react'
import { render } from '../../test-utils'

import TextField from './TextField'

describe('TextField', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TextField id="textfield-email">Email</TextField>
    )
    expect(baseElement).toBeTruthy()
  })
})
