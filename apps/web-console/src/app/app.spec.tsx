import React from 'react'
import { render, screen } from '../test-utils'

import App from './app'

describe('App', () => {
  it('should render successfully', async () => {
    const { baseElement } = render(<App />)
    expect(baseElement).toBeTruthy()
    await screen.findByText('Attached Disks')
  })
})
