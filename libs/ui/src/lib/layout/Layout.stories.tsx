import React from 'react'
import { Layout, LayoutProps } from './Layout'

export default {
  component: Layout,
  title: 'Layout/Skeleton',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: LayoutProps = {}

  return <Layout />
}
