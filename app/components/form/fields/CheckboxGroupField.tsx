/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useId } from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

import {
  Checkbox,
  CheckboxGroup,
  FieldLabel,
  TextInputHint,
  type CheckboxProps,
} from '@oxide/ui'
import { capitalize } from '@oxide/util'

type CheckboxGroupFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<CheckboxProps, 'name'> & {
  name: TName
  /** Will default to name if not provided */
  label?: string
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  tooltipText?: string
  description?: string
  units?: string
  control: Control<TFieldValues>
  items: { value: string; label: string }[]
  column?: boolean
}

export const CheckboxGroupField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label = capitalize(name),
  units,
  description,
  tooltipText,
  control,
  items,
  ...props
}: CheckboxGroupFieldProps<TFieldValues, TName>) => {
  const id = useId()
  return (
    <div>
      <div className="mb-2">
        {label && (
          <FieldLabel id={`${id}-label`} tip={tooltipText}>
            {label} {units && <span className="ml-1 text-secondary">({units})</span>}
          </FieldLabel>
        )}
        {description && <TextInputHint id={`${id}-help-text`}>{description}</TextInputHint>}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <CheckboxGroup
            name={name}
            {...props}
            onChange={(e) => {
              const newValue = e.target.checked
                ? [...value, e.target.value]
                : value.filter((x: string) => x !== e.target.value)
              onChange(newValue)
            }}
            defaultChecked={value}
          >
            {items.map(({ value: itemValue, label }) => (
              <Checkbox
                key={itemValue}
                value={itemValue}
                checked={value.includes(itemValue)}
              >
                {label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        )}
      />
    </div>
  )
}
