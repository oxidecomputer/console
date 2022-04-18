import { Button, FieldLabel, TextFieldHint } from '@oxide/ui'
import { capitalize } from '@oxide/util'
import React from 'react'

export interface TagsFieldProps {
  id: string
  name?: string
  title?: string
  hint?: string
  description?: string
}

export function TagsField(props: TagsFieldProps) {
  const { id, name = 'tags', title, hint, description } = props
  return (
    <div>
      <FieldLabel id={id} tip={description} optional>
        {title || capitalize(name)}
      </FieldLabel>
      {/* TODO: Should TextFieldHint be grouped with FieldLabel? */}
      {hint && <TextFieldHint id={`${id}-hint`}>{hint}</TextFieldHint>}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          // TODO: Replace with toast. Toast is grouped in app, probably shouldn't be?
          alert('not implemented')
        }}
      >
        Add tag
      </Button>
    </div>
  )
}
