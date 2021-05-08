import React from 'react'
import { render } from '../../test-utils'

import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Breadcrumbs data={[]} />)
    expect(baseElement).toBeTruthy()
  })
})
