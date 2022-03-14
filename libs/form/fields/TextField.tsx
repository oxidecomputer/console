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
  title?: string
  hint?: string
  description?: string
  placeholder?: string
}

export function TextField({
  id,
  name = id,
  title = name,
  ...props
}: TextFieldProps) {
  const { description, hint, required } = props
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
