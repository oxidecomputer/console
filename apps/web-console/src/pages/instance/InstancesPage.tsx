import React from 'react'
import styled from 'styled-components'

import { useParams } from 'react-router-dom'

import { Breadcrumbs, PageHeader, TextWithIcon } from '@oxide/ui'

const Title = styled(TextWithIcon).attrs({
  text: { variant: 'title', as: 'h1' },
  icon: { name: 'instances' },
})``

const breadcrumbs = [
  { href: '/', label: 'Maze War' },
  { href: '/first', label: 'Projects' },
  { href: '/second', label: 'prod-online' },
  { label: 'Instances' },
]

type Params = {
  projectName: string
}

const InstancesPage = () => {
  const { projectName } = useParams<Params>()
  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <Title>Instances for Project: {projectName}</Title>
      </PageHeader>
      <p style={{ marginTop: '2rem' }}>There is nothing here, sorry</p>
    </>
  )
}

export default InstancesPage
