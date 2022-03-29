import React, { Suspense, useMemo } from 'react'
import type { FormTypes } from 'app/forms/helpers/form-types'

interface FormPageProps<K extends keyof FormTypes> {
  id: K
}
export function FormPage<K extends keyof FormTypes>({
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
