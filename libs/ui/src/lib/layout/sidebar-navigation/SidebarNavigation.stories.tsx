import React from 'react'
import { SidebarNavigation, SidebarNavigationProps } from './SidebarNavigation'

export default {
  component: SidebarNavigation,
  title: 'Layout/SidebarNavigation',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: SidebarNavigationProps = {}

  return <SidebarNavigation />
}
