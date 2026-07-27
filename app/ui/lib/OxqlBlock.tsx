import { useState, useEffect } from 'react'
import {
  createHighlighter,
  type HighlighterGeneric,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki'

import theme from '../util/oxide-syntax.json'
import oxql from '../util/oxql.tmLanguage.json'

export const OxqlBlock = ({ children }: { children: string }) => {
  const [highlighter, setHighlighter] = useState<HighlighterGeneric<
    BundledLanguage,
    BundledTheme
  > | null>(null)

  useEffect(() => {
    const go = async () => {
      const highlighter = await createHighlighter({ themes: [theme], langs: [oxql] })
      setHighlighter(highlighter)
    }
    go()
  }, [])
  return (
    highlighter && (
      <pre
        className="text-mono-sm text-secondary border-secondary rounded-lg border p-3 normal-case"
        dangerouslySetInnerHTML={{
          __html: highlighter.codeToHtml(children, { lang: 'oxql', theme }),
        }}
      ></pre>
    )
  )
}
