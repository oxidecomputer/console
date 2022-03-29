import { SideModal } from '@oxide/ui'
import type { ComponentProps } from 'react'
import { useState, Suspense, useMemo } from 'react'
import React from 'react'
import type { FormTypes } from 'app/forms/helpers/form-types'

type FormProps<K extends keyof FormTypes> = Omit<
  ComponentProps<FormTypes[K]>,
  'id'
>

/**
 * Dynamically load a form from the `forms` directory where id is the name of the form. It
 * returns an element that can be used to render the form and an invocation function to display
 * the form. The invocation can take the form's props to alter the form's behavior.
 */
export const useForm = <K extends keyof FormTypes>(
  id: K,
  props?: FormProps<K>
) => {
  const [isOpen, setShowForm] = useState(false)
  const [formProps = {}, setFormProps] = useState<FormProps<K> | undefined>(
    props
  )
  const hideForm = () => setShowForm(false)
  const showForm = (props?: FormProps<K>) => {
    if (props) {
      setFormProps(props)
    }
    setShowForm(true)
  }
  const DynForm = useMemo(
    () => React.lazy(() => import(`../forms/${id}.tsx`)),
    [id]
  )

  return [
    <Suspense fallback={null} key={`${id}-key`}>
      <SideModal id={`${id}-modal`} isOpen={isOpen} onDismiss={hideForm}>
        <DynForm onDismiss={hideForm} {...formProps} />
      </SideModal>
    </Suspense>,
    showForm,
  ] as const
}
