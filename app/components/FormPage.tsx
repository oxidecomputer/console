import { PageHeader, PageTitle } from '@oxide/ui'
import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormPageProps {
  Form: React.ComponentType<{
    onSuccess: (data: { name: string }) => void
  }>
  goToCreatedPage?: boolean
  title: string
  icon?: React.ReactElement
}

export function FormPage({ Form, title, icon, goToCreatedPage = true }: FormPageProps) {
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null}>
      {title && (
        <PageHeader>
          <PageTitle icon={icon}>{title}</PageTitle>
        </PageHeader>
      )}
      <Form
        onSuccess={(data) =>
          goToCreatedPage ? navigate(`../${data.name}`) : navigate('..')
        }
      />
    </Suspense>
  )
}
