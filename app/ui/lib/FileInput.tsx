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
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type MouseEvent,
} from 'react'
import { mergeRefs } from 'react-merge-refs'

import { Document16Icon, Error16Icon } from '@oxide/ui'

import { Truncate } from '~/ui/lib/Truncate'

export type FileInputProps = Omit<ComponentProps<'input'>, 'type' | 'onChange'> & {
  onChange: (f: File | null) => void
  error?: boolean
}

// Wrapping a file input in a `<label>` grants the ability to fully
// customize the component whilst maintaining the native functionality
// and preserving it as an uncontrolled input
export const FileInput = forwardRef(
  ({ accept, className, onChange, error, ...inputProps }: FileInputProps, forwardedRef) => {
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
          ref={mergeRefs([inputRef, forwardedRef])}
          type="file"
          name="file"
          className={cn(
            '-z-1 absolute inset-0 w-full cursor-pointer rounded',
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
            'z-1 pointer-events-none relative flex flex-col items-center justify-center space-y-2 rounded border px-4 py-6 text-default bg-default',
            dragOver && 'bg-accent-secondary !border-accent-secondary',
            error
              ? '!border-error-secondary group-hover:border-error'
              : 'border-default group-hover:border-hover'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded p-1 text-accent bg-accent-secondary',
              dragOver && 'bg-accent-secondary-hover'
            )}
          >
            <Document16Icon className="h-4 w-4" />
          </div>
          <div className="flex h-8 items-center text-sans-md">
            {file && !dragOver ? (
              <div className="flex items-center text-default">
                <Truncate text={file.name} maxLength={32} position="middle" />
                <span className="ml-1 text-quaternary">
                  ({filesize(file.size, { base: 2, pad: true })})
                </span>
                <button
                  onClick={handleResetInput}
                  className="pointer-events-auto ml-1 inline-flex rounded p-1 hover:children:text-tertiary"
                  aria-label="Clear file"
                >
                  <Error16Icon className="text-quaternary" />
                </button>
              </div>
            ) : (
              <>
                Drop a file or click to browse{' '}
                {accept && (
                  <span className="ml-1 text-quaternary">
                    ({removeLeadingPeriods(accept)})
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </label>
    )
  }
)

// Takes an accept prop formatted like `accept=".doc,.docx,.tar.gz"` or
// `accept=".doc, .docx, .tar.gz"` removes the leading period and
// adds a space between each filetype
function removeLeadingPeriods(s: string): string {
  return s
    .split(',')
    .map((s) => s.trim().replace(/^\./, ''))
    .join(', ')
}
