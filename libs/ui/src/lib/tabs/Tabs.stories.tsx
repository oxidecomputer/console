import React, { FC } from 'react'
import { Tabs, TabsProps } from './Tabs'

export default {
  component: Tabs,
  title: 'Tabs',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: TabsProps = {}

  return <Tabs />
}
