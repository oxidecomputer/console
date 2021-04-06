import React from 'react'
import { Dropdown, DropdownProps } from '../Dropdown'

export default {
  component: Dropdown,
  title: 'Dropdown',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: DropdownProps = {}

  return <Dropdown />
}
