import React, { Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

type FormType = React.ComponentType<{
  onSuccess: (data: { name: string }) => void
}>

export function FormPage({ Form }: { Form: FormType }) {
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null}>
      <Form onSuccess={() => navigate(`..`)} />
    </Suspense>
  )
}
