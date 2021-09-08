import React from 'react'
import { Field } from 'formik'

type Props = {
  children: React.ReactNode
} & React.ComponentProps<'input'>

export const Radio = ({ children, ...inputProps }: Props) => (
  <label className="inline-flex items-center">
    <span className="h-4 w-4 relative">
      <Field
        className={`peer appearance-none absolute outline-none
          border border-gray-300 h-4 w-4 rounded-full hover:bg-gray-400
          focus:ring-2 focus:ring-green-700 disabled:cursor-not-allowed
          checked:bg-green-900 checked:border-green-500 hover:checked:bg-green-950`}
        type="radio"
        {...inputProps}
      />
      {/* the dot in the middle. hide by default, use peer-checked to show if checked */}
      <div className="hidden peer-checked:block absolute w-2 h-2 left-1 top-1 rounded-full bg-green-500" />
    </span>

    <span className="text-xs uppercase font-mono ml-2.5">{children}</span>
  </label>
)
