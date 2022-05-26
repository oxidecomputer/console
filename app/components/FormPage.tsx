import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormPageProps {
  Form: React.ComponentType<{
    onSuccess: (data: { name: string }) => void
  }>
  goToCreatedPage?: boolean
}

export function FormPage({ Form, goToCreatedPage = true }: FormPageProps) {
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null}>
      <Form
        onSuccess={(data) =>
          goToCreatedPage ? navigate(`../${data.name}`) : navigate('..')
        }
      />
    </Suspense>
  )
}
