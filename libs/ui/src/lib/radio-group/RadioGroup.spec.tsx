import React from 'react'
import { render } from '../../test-utils'

import { RadioGroup } from './RadioGroup'
import { RadioField } from '../radio-field/RadioField'

describe('RadioGroup', () => {
  it('should render successfully', () => {
    const { container } = render(
      <RadioGroup legend="Notifications" name="notifications-settings">
        <RadioField value="all">Everything</RadioField>
        <RadioField value="none">Nothing</RadioField>
      </RadioGroup>
    )
    expect(container).toBeTruthy()
  })
})
