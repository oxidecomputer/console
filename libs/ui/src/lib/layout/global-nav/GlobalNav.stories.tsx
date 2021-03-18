import React from 'react'
import { GlobalNav, GlobalNavProps } from './GlobalNav'

export default {
  component: GlobalNav,
  title: 'Layout/Global Navigation',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: GlobalNavProps = {}

  return <GlobalNav />
}
