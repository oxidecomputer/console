import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { FileInput } from './FileInput'

const file = new File(['hello'], 'stuff.png', { type: 'image/png' })

describe('FileInput', () => {
  it('calls onChange on file choose and reset click', async () => {
    const onChange = vi.fn()
    render(<FileInput data-testid="input" onChange={onChange} />)

    const input = screen.getByTestId('input')
    expect(screen.queryByText('stuff.png')).toBeNull()

    await waitFor(() => fireEvent.change(input, { target: { files: [file] } }))

    expect(onChange).toHaveBeenCalledWith(file)
    screen.getByText('stuff.png') // file is there

    // clear file
    act(() => {
      screen.getByRole('button', { name: 'Clear file' }).click()
    })

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByText('stuff.png')).toBeNull()
  })
})
