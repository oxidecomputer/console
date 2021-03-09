import React from 'react'
import { render } from '../../test-utils'

import Field from './Field'

describe('Field', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Field id="name" error={false}>
        Name
      </Field>
    )
    expect(baseElement).toBeTruthy()
  })
})
