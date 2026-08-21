/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/language'
import { Compartment, RangeSetBuilder } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  highlightActiveLine,
  keymap,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'
import cn from 'classnames'
import { useEffect, useRef } from 'react'
import {
  createHighlighterCoreSync,
  type LanguageRegistration,
  type ThemeRegistrationAny,
} from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// OxQL grammar copied from the design system so we can highlight queries
// without pulling in its full asciidoc bundle. One addition over the source:
// single-quoted strings, which OxQL supports and our examples use.
// https://github.com/oxidecomputer/design-system/blob/main/components/src/asciidoc/langs/oxql.tmLanguage.json
const oxqlGrammar = {
  name: 'oxql',
  scopeName: 'source.oxql',
  repository: {},
  patterns: [
    { name: 'keyword.control.oxql', match: '\\b(get|join|align|filter|group_by)\\b' },
    {
      name: 'string.quoted.double.oxql',
      begin: '"',
      end: '"',
      patterns: [{ name: 'constant.character.escape.oxql', match: '\\\\.' }],
    },
    {
      name: 'string.quoted.single.oxql',
      begin: "'",
      end: "'",
      patterns: [{ name: 'constant.character.escape.oxql', match: '\\\\.' }],
    },
    { name: 'constant.numeric.oxql', match: '\\b\\d+[smhdw]\\b' },
    {
      name: 'constant.numeric.datetime.oxql',
      match: '@\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}',
    },
    { name: 'constant.numeric.function.oxql', match: '@now\\(\\)' },
    { name: 'constant.numeric.oxql', match: '\\b\\d+\\b' },
    { name: 'comment.block.oxql', begin: '/\\*', end: '\\*/' },
    { name: 'comment.line.double-slash.oxql', match: '//.*$' },
    { name: 'keyword.operator.oxql', match: '\\|' },
  ],
} satisfies LanguageRegistration

// Subset of the design system's Oxide syntax theme covering the scopes the
// OxQL grammar emits. The --syntax-* vars come from the design system
// stylesheets already imported in app/ui/styles/index.css, so this follows
// the current theme automatically.
// https://github.com/oxidecomputer/design-system/blob/main/components/src/asciidoc/oxide-syntax.json
const oxideTheme = {
  name: 'oxide',
  colors: {
    'editor.background': 'transparent',
    'editor.foreground': 'var(--syntax-fg)',
  },
  tokenColors: [
    { scope: ['comment'], settings: { foreground: 'var(--syntax-comment)' } },
    { scope: ['string'], settings: { foreground: 'var(--syntax-string)' } },
    {
      scope: ['constant.character.escape'],
      settings: { foreground: 'var(--syntax-escape)' },
    },
    { scope: ['constant.numeric'], settings: { foreground: 'var(--syntax-number)' } },
    { scope: ['keyword'], settings: { foreground: 'var(--syntax-keyword)' } },
    { scope: ['keyword.operator'], settings: { foreground: 'var(--syntax-operator)' } },
  ],
} satisfies ThemeRegistrationAny

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
    theme: 'oxide',
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

// Ported from the editor theme in mitos (app/components/code-editor.tsx),
// with its hardcoded dark-palette hexes swapped for the equivalent design
// system vars so light mode works too. Text selection is native, so the
// console's global ::selection style applies without any theming here. The
// font comes from the wrapper (text-mono-code), hence the `inherit`s.
const cmTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--syntax-bg)',
    color: 'var(--syntax-fg)',
    // fixed height of ~6 lines; longer queries scroll inside the editor
    height: '7.5rem',
  },
  '.cm-scroller': { overflow: 'auto' },
  // the wrapper carries the focus ring (focus-within), so hide CM's own outline
  '&.cm-focused': { outline: 'none' },
  '.cm-content': {
    fontFamily: 'inherit',
    padding: '10px 0',
    caretColor: 'var(--syntax-fg)',
  },
  '.cm-line': { padding: '0 12px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--syntax-fg)' },
  '.cm-activeLine': { backgroundColor: 'var(--surface-secondary)' },
  '.cm-matchingBracket, .cm-nonmatchingBracket': {
    backgroundColor: 'var(--surface-hover)',
    outline: 'none',
  },
  '.cm-matchingBracket': { color: 'var(--syntax-fg)' },
  '.cm-nonmatchingBracket': { color: 'var(--content-destructive)' },
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
  'aria-label': string
}

/** A CodeMirror editor for OxQL queries with shiki syntax highlighting */
export function OxqlEditor({
  value,
  onChange,
  onSubmit,
  error = false,
  'aria-label': ariaLabel,
}: OxqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const attrsCompartment = useRef(new Compartment())

  // let the mount-once extensions see the latest props without reconfiguring
  const callbacks = useRef({ onChange, onSubmit })
  useEffect(() => {
    callbacks.current = { onChange, onSubmit }
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
        ]),
        EditorView.lineWrapping,
        highlightActiveLine(),
        bracketMatching(),
        shikiPlugin,
        cmTheme,
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

  return (
    <div
      ref={containerRef}
      className={cn(
        // mitos sizes its editor text at 12px, which is text-mono-code here
        'text-mono-code overflow-hidden rounded-md border focus-within:outline-2 focus-within:outline-solid',
        error
          ? 'border-error-secondary hover:border-error focus-within:outline-error-secondary'
          : 'border-default hover:border-raise focus-within:outline-accent-secondary'
      )}
    />
  )
}
