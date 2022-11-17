import cn from 'classnames'
import type {
  Control,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
} from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type {
  TextAreaProps as UITextAreaProps,
  TextInputBaseProps as UITextFieldProps,
} from '@oxide/ui'
import { TextInputHint } from '@oxide/ui'
import { FieldLabel, TextInput as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { useUuid } from 'app/hooks'

import { ErrorMessage } from './ErrorMessage'

export interface TextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends UITextFieldProps {
  name: TName
  /** HTML type attribute, defaults to text */
  type?: string
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
  units?: string
  // TODO: think about this doozy of a type
  validate?: Validate<FieldPathValue<TFieldValues, TName>>
  control: Control<TFieldValues>
}

export function TextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  label = capitalize(name),
  units,
  description,
  helpText,
  required,
  ...props
}: Omit<TextFieldProps<TFieldValues, TName>, 'id'> & UITextAreaProps) {
  // id is omitted from props because we generate it here
  const id = useUuid(name)
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label} {units && <span className="ml-1 text-secondary">({units})</span>}
        </FieldLabel>
      </div>
      {helpText && (
        <TextInputHint id={`${id}-help-text`} className="mb-2">
          {helpText}
        </TextInputHint>
      )}
      {/* passing the generated id is very important for a11y */}
      <TextFieldInner name={name} {...props} id={id} />
    </div>
  )
}

/**
 * Primarily exists to be called inside `TextField`, but we occasionally also
 * need a plain field without a label on it.
 *
 * Note that `id` is an allowed prop, unlike in `TextField`, where it is always
 * generated from `name`. This is because we need to pass the generated ID in
 * from there to here. For the case where `TextFieldInner` is used
 * independently, we also generate an ID for use only if none is passed in.
 */
export const TextFieldInner = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  type = 'text',
  label = capitalize(name),
  validate,
  control,
  description,
  required,
  id: idProp,
  ...props
}: TextFieldProps<TFieldValues, TName> & UITextAreaProps) => {
  const generatedId = useUuid(name)
  const id = idProp || generatedId
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, validate }}
      render={({ field, fieldState: { error } }) => {
        return (
          <>
            <UITextField
              id={id}
              title={label}
              type={type}
              error={!!error}
              aria-labelledby={cn(`${id}-label`, {
                [`${id}-help-text`]: !!description,
              })}
              aria-describedby={description ? `${id}-label-tip` : undefined}
              {...field}
              {...props}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )
      }}
    />
  )
}
