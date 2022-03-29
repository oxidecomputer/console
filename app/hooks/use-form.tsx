import { SideModal } from '@oxide/ui'
import type { ComponentProps } from 'react'
import { useState, Suspense, useMemo } from 'react'
import React from 'react'
import type { FormTypes } from 'app/forms/form-types'

type FormProps<K extends keyof FormTypes> = Omit<
  ComponentProps<FormTypes[K]>,
  'id'
>

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
