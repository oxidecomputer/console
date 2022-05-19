import { clickByRole, render, screen, waitFor } from 'app/test/utils'
import { Combobox } from './Combobox'
import { vi } from 'vitest'

const items = ['Hollow Knight', 'Rain World', 'Infinifactory']

describe('Combobox', () => {
  it('works', async () => {
    const onSelect = vi.fn()
    render(<Combobox items={items} onSelect={onSelect} />)

    // options not shown by default
    expect(screen.queryByRole('option')).toBeNull()

    // input empty
    expect(screen.getByRole('combobox')).toHaveValue('')

    // clicking combobox pops up options
    clickByRole('combobox')

    for (const item of items) {
      expect(screen.getByRole('option', { name: item })).toBeVisible()
    }

    // click an option
    clickByRole('option', 'Rain World')
    expect(onSelect).toHaveBeenCalledWith('Rain World')
    await waitFor(
      () => expect(screen.queryByRole('option')).toBeNull() // options go away
    )
  })
})
