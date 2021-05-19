import React from 'react'
import { render } from '../../test-utils'

import { AlertModal } from './Modal'

describe('Modal', () => {
  it('should render successfully', () => {
    const { container } = render(
      <AlertModal
        confirmText="Confirm"
        icon="check"
        title="Test"
        onConfirm={jest.fn()}
      >
        This is an alert!
      </AlertModal>
    )
    expect(container).toBeTruthy()
  })
})
