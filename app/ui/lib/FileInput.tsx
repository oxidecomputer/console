/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { filesize } from 'filesize'
import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type MouseEvent,
  type Ref,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { Document16Icon, Error16Icon } from '@oxide/design-system/icons/react'

import { Truncate } from '~/ui/lib/Truncate'

export type FileInputProps = Omit<ComponentProps<'input'>, 'type' | 'onChange'> & {
  onChange: (f: File | null) => void
  error?: boolean
  ref?: Ref<HTMLInputElement>
}

// Wrapping a file input in a `<label>` grants the ability to fully
// customize the component whilst maintaining the native functionality
// and preserving it as an uncontrolled input
export function FileInput({
  accept,
  className,
  onChange,
  error,
  ref,
  ...inputProps
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleChange = (evt: ChangeEvent) => {
    const target = evt.target as HTMLInputElement
    const targetFile = target.files ? target.files[0] : null

    setFile(targetFile)
    setDragOver(false)
    onChange?.(targetFile)
  }

  const handleResetInput = (evt: MouseEvent) => {
    setFile(null)
    onChange?.(null)
    if (inputRef && inputRef.current) {
      inputRef.current.value = ''
    }

    // Stop reset button click from opening file input
    evt.preventDefault()
  }

  return (
    <label className={cn(className, 'group relative block')}>
      <input
        ref={mergeRefs([inputRef, ref])}
        type="file"
        name="file"
        className={cn(
          'absolute inset-0 -z-1 w-full cursor-pointer rounded',
          error && 'focus-error'
        )}
        {...inputProps}
        onChange={handleChange}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => setDragOver(false)}
      />
      <div
        className={cn(
          'text-raise bg-default pointer-events-none relative z-1 flex flex-col items-center justify-center space-y-0.5 rounded-md border px-4 py-6',
          dragOver && 'bg-accent-secondary border-accent-secondary!',
          error
            ? 'border-error-secondary! group-hover:border-error'
            : 'border-default group-hover:border-hover'
        )}
      >
        <div
          className={cn(
            'text-accent bg-accent-secondary flex items-center justify-center rounded-md p-1',
            dragOver && 'bg-accent-secondary-hover'
          )}
        >
          <Document16Icon className="h-4 w-4" />
        </div>
        <div className="text-sans-md flex h-8 items-center">
          {file && !dragOver ? (
            <div className="text-raise flex items-center">
              <Truncate text={file.name} maxLength={32} position="middle" />
              <span className="text-tertiary ml-1">
                ({filesize(file.size, { base: 2, pad: true })})
              </span>
              <button
                type="button"
                onClick={handleResetInput}
                className="hover:*:text-secondary pointer-events-auto ml-1 inline-flex rounded-md p-1"
                aria-label="Clear file"
              >
                <Error16Icon className="text-tertiary" />
              </button>
            </div>
          ) : (
            <>
              Drop a file or click to browse{' '}
              {accept && (
                <span className="text-tertiary ml-1">({removeLeadingPeriods(accept)})</span>
              )}
            </>
          )}
        </div>
      </div>
    </label>
  )
}

// Takes an accept prop formatted like `accept=".doc,.docx,.tar.gz"` or
// `accept=".doc, .docx, .tar.gz"` removes the leading period and
// adds a space between each filetype
function removeLeadingPeriods(s: string): string {
  return s
    .split(',')
    .map((s) => s.trim().replace(/^\./, ''))
    .join(', ')
}
