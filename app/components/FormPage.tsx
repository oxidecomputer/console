import React, { Suspense, useMemo } from 'react'
import type { FormTypes } from 'app/forms'
interface FormPageProps<K extends keyof FormTypes> {
  id: K
}

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form.
 * This is generally used to render form pages from the routes file.
 */
export function FormPage<FormTypes, K extends keyof FormTypes>({
  id,
  ...props
}: FormPageProps<K>) {
  const DynForm = useMemo(
    () => React.lazy(() => import(`../forms/${id}.tsx`)),
    [id]
  )
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null} key={`${id}-key`}>
      <DynForm {...props} />
    </Suspense>
  )
}
