import React from 'react'
import { Breadcrumbs } from '@oxide/ui'

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { href: '/third', label: 'Instances' },
  { label: 'DB1' },
]

export default () => {
  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
    </>
  )
}
