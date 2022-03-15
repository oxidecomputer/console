import type { TextFieldProps as UITextFieldProps } from '@oxide/ui'
import { TextFieldError } from '@oxide/ui'
import { TextFieldHint } from '@oxide/ui'
import { FieldTitle, TextField as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import cn from 'classnames'
import React from 'react'
import { useError } from '../hooks/useError'

export interface TextFieldProps extends UITextFieldProps {
  id: string
  /** Will default to id if not provided */
  name?: string
  /** Will default to name if not provided */
  label?: string
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  helpText?: string
  /**
   * Displayed in a tooltip beside the title. This field should be used
   * for auxiliary context that helps users understand extra context about
   * a field but isn't specifically required to know how to complete the input.
   * This is announced as an `aria-description`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description
   */
  description?: string
  placeholder?: string
}

export function TextField({
  id,
  name = id,
  label: title = name,
  ...props
}: TextFieldProps) {
  const { description, helpText: hint, required } = props
  const error = useError(name)
  return (
    <div>
      <FieldTitle id={`${id}-title`} tip={description} optional={!required}>
        {title || capitalize(name)}
      </FieldTitle>
      {hint && <TextFieldHint id={`${id}-hint`}>{hint}</TextFieldHint>}
      <UITextField
        id={id}
        name={name}
        title={title}
        error={!!error}
        aria-labelledby={cn(`${id}-title`, {
          [`${id}-hint`]: !!description,
        })}
        aria-describedby={description ? `${id}-title-tip` : undefined}
        {...props}
      />
      <TextFieldError name={name} />
    </div>
  )
}
