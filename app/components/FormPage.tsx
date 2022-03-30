import React, { Suspense, useMemo } from 'react'
import type { FormTypes } from 'app/forms'
import { useNavigate } from 'react-router-dom'
interface FormPageProps<K extends keyof FormTypes> {
  id: K
}

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form.
 * This is generally used to render form pages from the routes file.
 */
export function FormPage<K extends keyof FormTypes>({
  id,
  ...props
}: FormPageProps<K>) {
  const DynForm = useMemo(
    () => React.lazy(() => import(`../forms/${id}.tsx`)),
    [id]
  )
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null} key={`${id}-key`}>
      <DynForm
        onSuccess={() => {
          navigate('../')
        }}
        {...props}
      />
    </Suspense>
  )
}
