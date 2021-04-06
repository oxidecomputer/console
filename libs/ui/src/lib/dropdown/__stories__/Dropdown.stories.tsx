import React from 'react'
import type { DropdownProps } from '../Dropdown'
import { Dropdown } from '../Dropdown'

export default {
  component: Dropdown,
  title: 'Dropdown',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: DropdownProps = {}

  return <Dropdown label="Choose an operator" />
}
