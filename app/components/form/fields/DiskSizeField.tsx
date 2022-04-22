import type { TextFieldProps } from './TextField'
import { TextField } from './TextField'
import React from 'react'
import { useFormikContext } from 'formik'
import { GiB } from '@oxide/util'
import invariant from 'tiny-invariant'

interface DiskSizeProps extends Omit<TextFieldProps, 'validate'> {
  blockSizeField?: string
}

export function DiskSizeField({
  required = true,
  name = 'diskSize',
  // TODO: combine disk size and block size fields into one component so we
  // don't have to sync them this way. (Or constrain disk size to integer GiB so
  // we don't have to validate — all integer GiB are multiples of 4096 bytes.)
  blockSizeField = 'blockSize',
  ...props
}: DiskSizeProps) {
  const { values } = useFormikContext<Record<string, number>>()
  invariant(blockSizeField in values, `expected form values to contain ${blockSizeField}`)
  const blockSize = values[blockSizeField]
  return (
    <TextField
      units="GiB"
      validate={getDiskValidator(blockSize)}
      type="number"
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
