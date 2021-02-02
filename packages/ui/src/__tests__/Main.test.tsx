import React from 'react'
import { render, screen } from '@testing-library/react'

const DemoComponent = () => <div>It Works!</div>

describe('Test Suite', () => {
  it('works', () => {
    expect(true).toBe(true)
  })

  it('works with JSX', () => {
    render(<DemoComponent />)
    const element = screen.getByText('It Works!')
    expect(element).toBeInTheDocument()
  })
})
