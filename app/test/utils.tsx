import { fireEvent, screen } from '@testing-library/react'

export { overrideOnce } from './server'

export * from '@testing-library/react'

// convenience functions so we can click and type in a one-liner. these were
// initially created to use the user-event library, but it was remarkably slow.
// see if those issues are improved before trying that again

export function clickByRole(role: string, name: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.click(element)
}

export function typeByRole(role: string, name: string, text: string) {
  const element = screen.getByRole(role, { name })
  fireEvent.change(element, { target: { value: text } })
}
