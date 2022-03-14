import type { TextFieldProps as UITextFieldProps } from '@oxide/ui'
import { TextFieldError } from '@oxide/ui'
import { TextFieldHint } from '@oxide/ui'
import { FieldTitle, TextField as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import cn from 'classnames'
import { useFormikContext } from 'formik'
import React from 'react'
import { useError } from '../hooks/useError'

export interface TextFieldProps extends UITextFieldProps {
  id: string
  name: string
  /** Will default to name if not provided */
  title?: string
  hint?: string
  description?: string
  placeholder?: string
}

export function TextField(props: TextFieldProps) {
  const { id, description, hint, name, title, required } = props
  const error = useError(name)
  return (
    <div>
      <FieldTitle id={`${id}-title`} tip={description} optional={!required}>
        {title || capitalize(name)}
      </FieldTitle>
      {hint && <TextFieldHint id={`${id}-hint`}>{hint}</TextFieldHint>}
      <UITextField
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
