import React from 'react'
import { render } from '@testing-library/react'

import SidebarNavigation from './SidebarNavigation'

describe('SidebarNavigation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SidebarNavigation />)
    expect(baseElement).toBeTruthy()
  })
})
