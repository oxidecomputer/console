import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

interface FormPageProps {
  // TODO: This obviously shouldn't be any, but the lower form types are fucked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Form: React.ComponentType<any>
  goToCreatedPage?: boolean
}

export function FormPage({ Form, goToCreatedPage = true }: FormPageProps) {
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null}>
      <Form
        onSuccess={(data: { name: string }) =>
          goToCreatedPage ? navigate(`../${data.name}`) : navigate('..')
        }
      />
    </Suspense>
  )
}
