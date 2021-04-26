import type { ReactFragment, ReactNode } from 'react'

export interface FieldProps {
  /**
   * ID of the form field this field represents
   */
  id: string
  /**
   * Is this field disabled?
   */
  disabled?: boolean
  /**
   * Is the field required in the form.
   */
  required?: boolean
  /**
   * Label for this field.
   */
  label: string | ReactFragment
  /**
   * Error message text to render, if truthy, marks the field as invalid
   */
  error?: string
  /**
   * Additional text to associate with this specific field, used to indicate what the field is used for
   */
  hint?: ReactNode
  /**
   * Additional text to show in a popover inside the text field, this content should not be requried to understand the use of the field
   */
  info?: ReactNode

  children: ReactNode
}
