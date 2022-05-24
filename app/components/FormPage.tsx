import { PageHeader, PageTitle } from '@oxide/ui'
import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

type FormType = React.ComponentType<{
  onSuccess: (data: { name: string }) => void
}>

type FormPageProps = {
  Form: FormType
  title: string
  icon?: React.ReactElement
}

export function FormPage({ Form, title, icon }: FormPageProps) {
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null}>
      {title && (
        <PageHeader>
          <PageTitle icon={icon}>{title}</PageTitle>
        </PageHeader>
      )}
      <Form onSuccess={(data) => navigate(`../${data.name}`)} />
    </Suspense>
  )
}
