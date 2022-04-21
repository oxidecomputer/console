import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'
import React from 'react'
import { useFormikContext } from 'formik'
import { GiB } from '@oxide/util'
import invariant from 'tiny-invariant'

interface DiskSizeProps extends Omit<TextFieldProps, 'validate'> {}

export function DiskSizeField({ required = true, name = 'size', ...props }: DiskSizeProps) {
  const { values } = useFormikContext<{ blockSize: number }>()
  const { blockSize } = values
  invariant(blockSize, 'Expected form to have a field with the name `blockSize`')
  return (
    <TextField
      validate={getDiskValidator(blockSize)}
      type="number"
      min={1}
      required={required}
      name={name}
      {...props}
    />
  )
}

export const getDiskValidator = (blockSize: number) => (size: number) => {
  if (size === 0) {
    return 'Disk size must be greater than 0'
  } else if ((size * GiB) % blockSize !== 0) {
    return 'Disk size must be a multiple of the block size'
  }
}
