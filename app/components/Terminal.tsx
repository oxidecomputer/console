import { useEffect, useRef, useState } from 'react'
import type { ITerminalAddon, ITerminalOptions } from 'xterm'
import { Terminal as XTerm } from 'xterm'
import 'xterm/css/xterm.css'

interface TerminalProps {
  options?: ITerminalOptions
  addons?: ITerminalAddon[]
  data?: number[]
}

export const Terminal = ({ options, addons, data }: TerminalProps) => {
  const [term, setTerm] = useState<XTerm | null>(null)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (!term) {
      setTerm(new XTerm(options))
    } else {
      for (const addon of addons || []) {
        term.loadAddon(addon)
      }
    }
    return () => term?.dispose()
  }, [term, options, addons])

  // Register term in the dom
  useEffect(() => {
    if (terminalRef.current && term) {
      term.open(terminalRef.current)
      if (data) {
        term.write(new Uint8Array(data))
      }
    }
  }, [term, data])

  return <div ref={terminalRef} />
}
