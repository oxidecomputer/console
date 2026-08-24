/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/language'
import {
  Compartment,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Text,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  highlightActiveLine,
  keymap,
  placeholder,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'
import cn from 'classnames'
import { useEffect, useRef } from 'react'
import { createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import type { TimeseriesSchema } from '@oxide/api'
import { oxideTheme, oxqlGrammar } from '@oxide/design-system/syntax'

import { oxqlAutocomplete } from '~/components/oxql-autocomplete'
import type { OxqlDiagnostic } from '~/components/oxql-error'

// the --syntax-* vars in the theme come from the design system stylesheets
// already imported in app/ui/styles/index.css, so colors follow the theme
const highlighter = createHighlighterCoreSync({
  langs: [oxqlGrammar],
  themes: [oxideTheme],
  engine: createJavaScriptRegexEngine(),
})

/**
 * Tokenize the whole doc with shiki and turn the tokens into CodeMirror mark
 * decorations. Queries are small, so retokenizing everything on each change
 * is cheap.
 */
const buildDecorations = (view: EditorView): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>()
  const code = view.state.doc.toString()
  let pos = 0
  for (const line of highlighter.codeToTokensBase(code, {
    lang: 'oxql',
    theme: oxideTheme.name,
  })) {
    for (const token of line) {
      const end = pos + token.content.length
      // default-colored tokens don't need a decoration
      if (token.color && token.color !== 'var(--syntax-fg)') {
        builder.add(
          pos,
          end,
          Decoration.mark({ attributes: { style: `color: ${token.color}` } })
        )
      }
      pos = end
    }
    pos += 1 // newline
  }
  return builder.finish()
}

const shikiPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }
    update(update: ViewUpdate) {
      if (update.docChanged) this.decorations = buildDecorations(update.view)
    }
  },
  { decorations: (v) => v.decorations }
)

// Convert a 1-based line:column server error position into an editor range
// covering the offending token. Positions are clamped so a stale or
// out-of-range position can't crash the editor.
const toErrorRange = (doc: Text, { line, column }: OxqlDiagnostic) => {
  const lineInfo = doc.line(Math.max(1, Math.min(line, doc.lines)))
  let from = Math.min(lineInfo.from + column - 1, lineInfo.to)
  // underline through the end of the token under the caret, or one char minimum
  const token = /^[@\w:]+/.exec(doc.sliceString(from, lineInfo.to))
  const to = Math.min(from + (token?.[0].length || 1), lineInfo.to)
  // at end of line there's nothing after the caret, so underline the char before
  if (from === to) from = Math.max(lineInfo.from, to - 1)
  // mark decorations may not be empty, so an empty line gets no underline
  return from < to ? { from, to } : null
}

const errorMark = Decoration.mark({ class: 'oxql-error-underline' })

const setErrorRange = StateEffect.define<{ from: number; to: number } | null>()

// Underline the position a server-side parse error points at. The error
// message itself is shown below the editor, so no lint tooltip is needed.
// A StateField (rather than a plain decoration facet) so the range remaps
// when the user edits elsewhere in the doc.
const errorRangeField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    let mapped = deco.map(tr.changes)
    for (const effect of tr.effects) {
      if (effect.is(setErrorRange)) {
        mapped = effect.value
          ? Decoration.set([errorMark.range(effect.value.from, effect.value.to)])
          : Decoration.none
      }
    }
    return mapped
  },
  provide: (f) => EditorView.decorations.from(f),
})

const contentAttrs = (ariaLabel: string, error: boolean) =>
  EditorView.contentAttributes.of({
    'aria-label': ariaLabel,
    'aria-invalid': error ? 'true' : 'false',
  })

type OxqlEditorProps = {
  value: string
  onChange: (value: string) => void
  /** Called on cmd+enter / ctrl+enter */
  onSubmit: () => void
  error?: boolean
  /** Server-reported parse error position, underlined in the editor */
  diagnostic?: OxqlDiagnostic
  /** Timeseries schemas backing name and field completions. May load after mount. */
  schemas?: TimeseriesSchema[]
  'aria-label': string
}

/** A CodeMirror editor for OxQL queries with shiki syntax highlighting */
export function OxqlEditor({
  value,
  onChange,
  onSubmit,
  error = false,
  diagnostic,
  schemas,
  'aria-label': ariaLabel,
}: OxqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const attrsCompartment = useRef(new Compartment())

  // let the mount-once extensions see the latest props without reconfiguring
  const callbacks = useRef({ onChange, onSubmit })
  const schemasRef = useRef(schemas)
  useEffect(() => {
    callbacks.current = { onChange, onSubmit }
    schemasRef.current = schemas
  })

  useEffect(() => {
    const view = new EditorView({
      // container div is always mounted when this effect runs
      parent: containerRef.current!,
      doc: value,
      extensions: [
        history(),
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              callbacks.current.onSubmit()
              return true
            },
          },
          ...defaultKeymap,
          ...historyKeymap,
          // tab indents instead of moving focus. the standard escape hatch
          // still works: Ctrl-m (from defaultKeymap) toggles tab focus mode
          indentWithTab,
        ]),
        EditorView.lineWrapping,
        placeholder('get sled_data_link:bytes_sent | filter timestamp > @now() - 5m'),
        highlightActiveLine(),
        bracketMatching(),
        oxqlAutocomplete(() => schemasRef.current ?? []),
        shikiPlugin,
        errorRangeField,
        attrsCompartment.current.of(contentAttrs(ariaLabel, error)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) callbacks.current.onChange(update.state.doc.toString())
        }),
      ],
    })
    viewRef.current = view
    return () => view.destroy()
    // value and the aria attrs are synced by the effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sync external value changes (e.g., clicking an example) into the editor
  useEffect(() => {
    const view = viewRef.current
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
    }
  }, [value])

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: attrsCompartment.current.reconfigure(contentAttrs(ariaLabel, error)),
    })
  }, [ariaLabel, error])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const range = diagnostic ? toErrorRange(view.state.doc, diagnostic) : null
    view.dispatch({ effects: setErrorRange.of(range) })
  }, [diagnostic])

  return (
    <div
      ref={containerRef}
      className={cn(
        // oxql-editor scopes the CodeMirror styles in oxql-editor.css
        'oxql-editor text-mono-code overflow-hidden rounded-md border focus-within:outline-2 focus-within:outline-solid',
        error
          ? 'border-error-secondary hover:border-error focus-within:outline-error-secondary'
          : 'border-default hover:border-raise focus-within:outline-accent-secondary'
      )}
    />
  )
}
