import React from 'react'
import { Navigation, NavigationProps } from './Navigation'

export default {
  component: Navigation,
  title: 'Navigation',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: NavigationProps = {}

  return <Navigation />
}
