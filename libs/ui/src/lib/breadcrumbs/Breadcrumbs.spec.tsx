import React from 'react'
import { render } from '@testing-library/react'

import Breadcrumbs from './Breadcrumbs'

describe('Breadcrumbs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Breadcrumbs />)
    expect(baseElement).toBeTruthy()
  })
})
