import React from 'react'
import type { GlobalNavProps } from './GlobalNav'
import { GlobalNav } from './GlobalNav'

export default {
  component: GlobalNav,
  title: 'Layout/Global Navigation',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: GlobalNavProps = {}

  return <GlobalNav />
}
