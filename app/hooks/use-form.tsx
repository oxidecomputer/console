import { SideModal } from '@oxide/ui'
import { useCallback } from 'react'
import { useState, Suspense, useMemo } from 'react'
import React from 'react'
import type { FormTypes, DynamicFormProps } from 'app/forms'

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form. It
 * returns an element that can be used to render the form and an invocation function to display
 * the form. The invocation can take the form's props to alter the form's behavior.
 */
export const useForm = <K extends keyof FormTypes>(
  id: K,
  props?: DynamicFormProps<K>
) => {
  const [isOpen, setShowForm] = useState(false)
  const [formProps, setFormProps] = useState<DynamicFormProps<K> | undefined>(
    props
  )

  const invokeForm = (props?: DynamicFormProps<K>) => {
    if (props) {
      setFormProps(props)
    }
    setShowForm(true)
  }

  const onDismiss = useCallback(() => {
    setShowForm(false)
    formProps?.onDismiss?.()
  }, [formProps, setShowForm])

  const onSuccess = useCallback(
    (data) => {
      setShowForm(false)
      formProps?.onSuccess?.(data)
    },
    [formProps, setShowForm]
  )

  const DynForm = useMemo(
    () => React.lazy<FormTypes[K]>(() => import(`../forms/${id}.tsx`)),
    [id]
  )

  return [
    <Suspense fallback={null} key={`${id}-key`}>
      <SideModal id={`${id}-modal`} isOpen={isOpen} onDismiss={onDismiss}>
        {/* @ts-expect-error TODO: Figure out why this is erroring */}
        <DynForm onDismiss={onDismiss} onSuccess={onSuccess} {...formProps} />
      </SideModal>
    </Suspense>,
    invokeForm,
  ] as const
}
