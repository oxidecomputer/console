import type { ComponentProps } from 'react'
import React, { Suspense, useMemo } from 'react'
import type { FormTypes } from 'app/forms'
import { useNavigate } from 'react-router-dom'

type FormPageProps<K extends keyof FormTypes> = {
  type: K
} & ComponentProps<FormTypes[K]>

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form.
 * This is generally used to render form pages from the routes file.
 */
export function FormPage<K extends keyof FormTypes>({ type, ...props }: FormPageProps<K>) {
  const DynForm = useMemo(
    () => React.lazy<FormTypes[K]>(() => import(`../forms/${type}.tsx`)),
    [type]
  )
  const navigate = useNavigate()
  return (
    // TODO: Add a proper loading state
    <Suspense fallback={null} key={type}>
      {/* @ts-expect-error TODO: Figure out why this is failing */}
      <DynForm
        // Should be fixed when the issue above is fixed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess={(data: any) => {
          navigate(`../${data?.name ?? ''}`)
        }}
        {...props}
      />
    </Suspense>
  )
}
