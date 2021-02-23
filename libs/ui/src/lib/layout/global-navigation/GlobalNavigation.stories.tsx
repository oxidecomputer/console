import React from 'react'
import { GlobalNavigation, GlobalNavigationProps } from './GlobalNavigation'

export default {
  component: GlobalNavigation,
  title: 'Layout/GlobalNavigation',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: GlobalNavigationProps = {}

  return <GlobalNavigation />
}
