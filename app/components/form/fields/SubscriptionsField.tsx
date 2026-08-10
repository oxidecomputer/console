/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import cn from 'classnames'
import { useCallback, useId, useRef, useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import { api, q } from '@oxide/api'
import { Close8Icon } from '@oxide/design-system/icons/react'

import { ALERT_SUBSCRIPTION_REGEX, isGlobPattern, subscriptionRegex } from '~/api/util'
import type { WebhookCreateFormValues } from '~/forms/webhook-create'
import { Checkbox } from '~/ui/lib/Checkbox'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { TextInputError } from '~/ui/lib/TextInput'
import { Tooltip } from '~/ui/lib/Tooltip'
import { KEYS } from '~/ui/util/keys'
import { ALL_ISH } from '~/util/consts'

// segments may only contain [a-zA-Z0-9_], unlike resource names
export const validateSubscription = (value: string) =>
  ALERT_SUBSCRIPTION_REGEX.test(value)
    ? undefined
    : 'Must be an event class or a glob pattern like hardware.** (letters, numbers, and underscores only)'

function SubscriptionChip({
  value,
  matchCount,
  armed,
  onRemove,
}: {
  value: string
  /** Number of event classes a glob matches; undefined while classes load */
  matchCount?: number
  armed: boolean
  onRemove: () => void
}) {
  const glob = isGlobPattern(value)
  const chip = (
    <span
      className={cn(
        'text-sans-md inline-flex h-6 items-center rounded-sm pl-1.5',
        glob ? 'bg-accent text-accent' : 'bg-accent-alt text-accent-alt',
        armed && 'outline-2 -outline-offset-1 outline-accent-secondary'
      )}
    >
      {value}
      <button
        type="button"
        aria-label={`remove subscription ${value}`}
        className="flex h-full cursor-pointer items-center px-1.5 opacity-60 hover:opacity-100"
        onClick={onRemove}
      >
        <Close8Icon />
      </button>
    </span>
  )
  return glob ? (
    <Tooltip
      content={
        matchCount === undefined
          ? undefined
          : `Matches ${matchCount} event ${matchCount === 1 ? 'class' : 'classes'}`
      }
    >
      {chip}
    </Tooltip>
  ) : (
    chip
  )
}

function HighlightedName({ name, query }: { name: string; query: string }) {
  const idx = name.toLowerCase().indexOf(query.toLowerCase())
  if (!query || idx === -1) return <>{name}</>
  return (
    <>
      {name.slice(0, idx)}
      <span className="text-raise">{name.slice(idx, idx + query.length)}</span>
      <span className="text-secondary">{name.slice(idx + query.length)}</span>
    </>
  )
}

type RowState =
  | { kind: 'covered'; via: string }
  | { kind: 'picked' }
  | { kind: 'pending' }
  /** Not matched by the query glob, but would be by a broader `**` version */
  | { kind: 'promoted'; via: string }
  | { kind: 'plain' }

export function SubscriptionsField({
  control,
}: {
  control: Control<WebhookCreateFormValues>
}) {
  const id = useId()
  const listboxId = `${id}-listbox`
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Keep the open panel visually stationary when adding or removing chips
  // wraps the shell to a different number of lines: the panel hangs off the
  // shell's bottom edge, so scrolling the page by the height delta cancels
  // the layout shift. The input row (the shell's last line) stays put too;
  // only the content above shifts. useCallback so the observer isn't torn
  // down and recreated on every render.
  const observeShellResize = useCallback((el: HTMLDivElement) => {
    let prevHeight = el.offsetHeight
    const observer = new ResizeObserver(() => {
      const delta = el.offsetHeight - prevHeight
      prevHeight = el.offsetHeight
      if (delta === 0 || !panelRef.current) return
      // instant, and ResizeObserver fires between layout and paint, so the
      // compensation is never visible as motion. If the page can't scroll
      // far enough (already at the top or bottom), the panel just moves as
      // it would have without compensation.
      window.scrollBy({ top: delta, behavior: 'instant' })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { field } = useController({ control, name: 'subscriptions' })
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  // index of the chip primed for deletion. Backspace on an empty query arms
  // the last chip; arrow keys move the armed selection through the chips.
  const [armedIdx, setArmedIdx] = useState<number | null>(null)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [commitError, setCommitError] = useState<string>()

  const { data } = useQuery(q(api.alertClassList, { query: { limit: ALL_ISH } }))
  const classes = data?.items ?? []

  const committed = field.value
  const globRegexes = committed
    .filter(isGlobPattern)
    .map((g) => [g, subscriptionRegex(g)] as const)
  const exacts = new Set(committed.filter((s) => !isGlobPattern(s)))

  const queryTrimmed = query.trim()
  const queryIsValidGlob =
    isGlobPattern(queryTrimmed) && ALERT_SUBSCRIPTION_REGEX.test(queryTrimmed)
  const queryRegex = queryIsValidGlob ? subscriptionRegex(queryTrimmed) : null
  // broadest version of the query glob (all `*` promoted to `**`), used to keep
  // near-miss rows visible with a hint about the pattern that would cover them
  const promotedGlob = queryIsValidGlob
    ? queryTrimmed.replaceAll('*', '**').replaceAll('****', '**')
    : null
  const promotedRegex = promotedGlob ? subscriptionRegex(promotedGlob) : null

  const visible =
    queryTrimmed === ''
      ? classes
      : promotedRegex
        ? classes.filter((c) => promotedRegex.test(c.name))
        : classes.filter((c) => c.name.toLowerCase().includes(queryTrimmed.toLowerCase()))

  // precedence: covered > picked > pending > promoted > plain
  function rowState(name: string): RowState {
    const via = globRegexes.find(([, re]) => re.test(name))?.[0]
    if (via) return { kind: 'covered', via }
    if (exacts.has(name)) return { kind: 'picked' }
    if (queryRegex?.test(name)) return { kind: 'pending' }
    if (promotedGlob && promotedGlob !== queryTrimmed) {
      return { kind: 'promoted', via: promotedGlob }
    }
    return { kind: 'plain' }
  }

  const rows = visible.map((c) => ({ ...c, state: rowState(c.name) }))
  // covered rows can't be toggled, so keyboard nav skips them
  const selectableIdxs = rows.flatMap((row, i) => (row.state.kind === 'covered' ? [] : [i]))

  const optionId = (idx: number) => `${id}-opt-${idx}`

  function commitQuery() {
    const value = queryTrimmed
    const error = validateSubscription(value)
    if (error) {
      setCommitError(error)
      return
    }
    if (!committed.includes(value)) field.onChange([...committed, value])
    setQuery('')
    setCommitError(undefined)
    setActiveIdx(null)
  }

  function toggleRow(name: string) {
    const state = rowState(name)
    if (state.kind === 'covered') return
    field.onChange(
      state.kind === 'picked' ? committed.filter((c) => c !== name) : [...committed, name]
    )
    // query is deliberately not reset so multiple picks are cheap
  }

  function removeChip(value: string) {
    field.onChange(committed.filter((c) => c !== value))
    // indexes shift after removal, so any armed selection is stale
    setArmedIdx(null)
  }

  function moveActive(dir: 1 | -1) {
    if (selectableIdxs.length === 0) return
    const pos = activeIdx === null ? -1 : selectableIdxs.indexOf(activeIdx)
    const nextPos =
      pos === -1
        ? dir === 1
          ? 0
          : selectableIdxs.length - 1
        : (pos + dir + selectableIdxs.length) % selectableIdxs.length
    const next = selectableIdxs[nextPos]
    setActiveIdx(next)
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' })
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === KEYS.enter) {
      e.preventDefault() // never submit the outer form from this input
      if (open && activeIdx !== null && rows[activeIdx]) {
        toggleRow(rows[activeIdx].name)
      } else if (queryTrimmed) {
        commitQuery()
      }
    } else if (e.key === KEYS.backspace || e.key === KEYS.delete) {
      if (armedIdx !== null) {
        e.preventDefault()
        removeChip(committed[armedIdx])
      } else if (e.key === KEYS.backspace && query === '' && committed.length > 0) {
        setArmedIdx(committed.length - 1)
      }
      // otherwise fall through to normal text deletion
    } else if (e.key === KEYS.left) {
      const input = inputRef.current
      const caretAtStart = input?.selectionStart === 0 && input?.selectionEnd === 0
      if (armedIdx !== null) {
        e.preventDefault()
        setArmedIdx(Math.max(0, armedIdx - 1))
      } else if (caretAtStart && committed.length > 0) {
        e.preventDefault()
        setArmedIdx(committed.length - 1)
      }
    } else if (e.key === KEYS.right && armedIdx !== null) {
      e.preventDefault()
      // moving right off the last chip returns to the input text
      setArmedIdx(armedIdx === committed.length - 1 ? null : armedIdx + 1)
    } else if (e.key === KEYS.escape && open) {
      // keep focus but close the panel; stop the event so the page/form
      // doesn't also react to Escape
      e.stopPropagation()
      setOpen(false)
      setArmedIdx(null)
      setActiveIdx(null)
    } else if (e.key === KEYS.down) {
      e.preventDefault()
      if (!open) setOpen(true)
      setArmedIdx(null)
      moveActive(1)
    } else if (e.key === KEYS.up) {
      e.preventDefault()
      setArmedIdx(null)
      moveActive(-1)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} htmlFor={`${id}-input`} optional>
          Event subscriptions
        </FieldLabel>
      </div>
      <div
        className="relative"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setOpen(false)
            setArmedIdx(null)
            setActiveIdx(null)
            setCommitError(undefined)
          }
        }}
      >
        {/* click anywhere in the shell to focus the input; the input itself is
            the interactive element, so no role or keyboard handler is needed */}
        {/* oxlint-disable-next-line click-events-have-key-events, no-static-element-interactions */}
        <div
          ref={observeShellResize}
          className={cn(
            'bg-default flex min-h-10 cursor-text flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-2',
            commitError
              ? 'focus-error border-error-secondary focus-within:ring-error-secondary hover:border-error'
              : 'border-default focus-within:ring-accent-secondary hover:border-raise'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {committed.map((value, i) => (
            <SubscriptionChip
              key={value}
              value={value}
              matchCount={
                isGlobPattern(value) && data
                  ? classes.filter((c) => subscriptionRegex(value).test(c.name)).length
                  : undefined
              }
              armed={armedIdx === i}
              onRemove={() => removeChip(value)}
            />
          ))}
          <input
            ref={inputRef}
            id={`${id}-input`}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIdx !== null ? optionId(activeIdx) : undefined}
            autoComplete="off"
            spellCheck="false"
            className="text-sans-md text-raise placeholder:text-tertiary h-6 min-w-24 flex-1 border-none bg-transparent outline-none"
            placeholder={committed.length === 0 ? 'Filter or type a pattern' : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setArmedIdx(null)
              setCommitError(undefined)
              setActiveIdx(null)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
        </div>
        {open && (
          // ARIA 1.2 combobox pattern: focus stays on the input, which points at
          // the active row via aria-activedescendant, so the listbox and options
          // are divs and never take focus themselves
          <div
            ref={panelRef}
            id={listboxId}
            // oxlint-disable-next-line prefer-tag-over-role
            role="listbox"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            className="ox-menu shadow-menu-inset border-secondary absolute inset-x-0 top-full z-10 mt-3 overflow-y-auto border"
            // prevent the input from losing focus when clicking inside the panel
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="text-sans-md text-secondary border-secondary bg-raise sticky -inset-x-px -top-px z-10 flex items-center justify-between border-b px-3 py-2">
              {queryTrimmed === '' ? (
                <>
                  <span>All classes</span>
                  <span className="text-tertiary">Showing {classes.length}</span>
                </>
              ) : (
                <>
                  <span>Matching &ldquo;{queryTrimmed}&rdquo;</span>
                  <span className="text-tertiary">
                    Showing {rows.length} of {classes.length}
                  </span>
                </>
              )}
            </div>
            {/* no empty state while classes are still loading */}
            {rows.length === 0 && data ? (
              <div className="flex justify-center py-4">
                <EmptyMessage
                  title="No classes match"
                  body="Check the pattern or clear to see them all"
                  buttonText="Clear"
                  onClick={() => setQuery('')}
                />
              </div>
            ) : (
              rows.map((row, i) => {
                const { state } = row
                const covered = state.kind === 'covered'
                return (
                  // oxlint-disable-next-line click-events-have-key-events, interactive-supports-focus
                  <div
                    key={row.name}
                    id={optionId(i)}
                    // oxlint-disable-next-line prefer-tag-over-role
                    role="option"
                    aria-selected={state.kind === 'picked'}
                    aria-disabled={covered || undefined}
                    className={cn(
                      'ox-menu-item border-secondary flex items-center gap-2.5 py-1.5 border-b last:border-0',
                      { 'is-highlighted': i === activeIdx },
                      'hover:bg-hover',
                      covered && 'cursor-default'
                    )}
                    onClick={() => toggleRow(row.name)}
                  >
                    <span aria-hidden className="pointer-events-none">
                      <Checkbox
                        checked={state.kind === 'picked'}
                        indeterminate={covered}
                        disabled={covered}
                        readOnly
                        tabIndex={-1}
                      />
                    </span>
                    <span className={cn('flex-1', covered && 'text-disabled')}>
                      {queryTrimmed && !queryRegex ? (
                        <HighlightedName name={row.name} query={queryTrimmed} />
                      ) : (
                        row.name
                      )}
                    </span>
                    {state.kind === 'covered' && (
                      <span className="text-mono-xs text-tertiary">via {state.via}</span>
                    )}
                    {state.kind === 'pending' && (
                      <span className="text-mono-xs text-accent-secondary">
                        {queryTrimmed}
                      </span>
                    )}
                    {state.kind === 'promoted' && (
                      <span className="text-mono-xs text-tertiary">{state.via}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
      {commitError && <TextInputError>{commitError}</TextInputError>}
    </div>
  )
}
