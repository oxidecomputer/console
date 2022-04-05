import type { ComponentProps } from 'react'
import { SideModal } from '@oxide/ui'
import { useCallback } from 'react'
import { useState, Suspense, useMemo } from 'react'
import React from 'react'
import type { FormTypes } from 'app/forms'

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form. It
 * returns an element that can be used to render the form and an invocation function to display
 * the form. The invocation can take the form's props to alter the form's behavior.
 */
export const useForm = <K extends keyof FormTypes>(
  type: K,
  props?: ComponentProps<FormTypes[K]>
) => {
  const [isOpen, setShowForm] = useState(false)
  const [formProps, setFormProps] = useState(props)

  const showForm = (innerProps?: typeof props) => {
    if (innerProps) {
      setFormProps(innerProps)
    }
    setShowForm(true)
    return () => setShowForm(false)
  }

  const onDismiss = useCallback(() => {
    setShowForm(false)
    formProps?.onDismiss?.()
  }, [formProps, setShowForm])

  const onSuccess = useCallback(
    (data, params) => {
      setShowForm(false)
      formProps?.onSuccess?.(data, params)
    },
    [formProps, setShowForm]
  )

  const DynForm = useMemo(
    () => React.lazy<FormTypes[K]>(() => import(`../forms/${type}.tsx`)),
    [type]
  )

  return [
    <Suspense fallback={null} key={type}>
      <SideModal id={`${type}-modal`} isOpen={isOpen} onDismiss={onDismiss}>
        {/* @ts-expect-error TODO: Figure out why this is erroring */}
        <DynForm onDismiss={onDismiss} onSuccess={onSuccess} {...formProps} />
      </SideModal>
    </Suspense>,
    showForm,
  ] as const
}
