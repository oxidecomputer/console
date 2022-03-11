import type { TextFieldProps as UITextFieldProps } from '@oxide/ui'
import { TextFieldHint } from '@oxide/ui'
import { FieldTitle, TextField as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import cn from 'classnames'
import React from 'react'
import type { Field } from './Field'

export interface TextFieldProps
  extends Field<string>,
    Omit<UITextFieldProps, 'name'> {
  id: string
  /** Will default to name if not provided */
  title?: string
  hint?: string
  description?: string
  placeholder?: string
}

TextField.initialValue = ''

export function TextField({
  id,
  title,
  description,
  hint,
  ...inputProps
}: TextFieldProps) {
  return (
    <>
      <FieldTitle id={`${id}-title`} tip={description}>
        {title || capitalize(inputProps.name)}
      </FieldTitle>
      {hint && <TextFieldHint id={`${id}-hint`}>{hint}</TextFieldHint>}
      <UITextField
        id={id}
        aria-labelledby={cn(`${id}-title`, {
          [`${id}-hint`]: !!description,
        })}
        aria-describedby={description ? `${id}-title-tip` : undefined}
        {...inputProps}
      />
    </>
  )
}
