import { useEffect, useRef, useState } from 'react'
import type { ITerminalAddon, ITerminalOptions } from 'xterm'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalProps {
  data?: number[]
}

const options: ITerminalOptions = {
  allowTransparency: false,
  screenReaderMode: true,
  // rendererType: 'dom',
  minimumContrastRatio: 21,
  windowOptions: {
    fullscreenWin: true,
    refreshWin: true,
  },
}
const fitAddon = new FitAddon()
const addons: ITerminalAddon[] = [fitAddon]

export const Terminal = ({ data }: TerminalProps) => {
  const [term, setTerm] = useState<XTerm | null>(null)
  const terminalRef = useRef(null)

  useEffect(() => {
    if (!term) {
      const style = getComputedStyle(document.body)
      console.log(style.getPropertyValue('--surface-default'))
      setTerm(
        new XTerm({
          theme: {
            background: style.getPropertyValue('--surface-default'),
            foreground: style.getPropertyValue('--content-default'),
            black: style.getPropertyValue('--surface-default'),
            brightBlack: style.getPropertyValue('--surface-secondary'),
            white: style.getPropertyValue('--content-default'),
            brightWhite: style.getPropertyValue('--content-secondary'),
            blue: style.getPropertyValue('--base-blue-500'),
            brightBlue: style.getPropertyValue('--base-blue-900'),
            green: style.getPropertyValue('--content-success'),
            brightGreen: style.getPropertyValue('--content-success-secondary'),
            red: style.getPropertyValue('--content-error'),
            brightRed: style.getPropertyValue('--content-error-secondary'),
            yellow: style.getPropertyValue('--content-notice'),
            brightYellow: style.getPropertyValue('--content-notice-secondary'),
            cursor: style.getPropertyValue('--content-default'),
            cursorAccent: style.getPropertyValue('--content-accent'),
          },
          ...options,
        })
      )
    } else {
      for (const addon of addons) {
        term.loadAddon(addon)
      }
    }
    return () => term?.dispose()
  }, [term])

  // Register term in the dom
  useEffect(() => {
    if (terminalRef.current && term) {
      term.open(terminalRef.current)
      fitAddon.fit()
    }
  }, [term])

  useEffect(() => {
    if (data) {
      term?.write(new Uint8Array(data))
    }
  }, [term, data])

  useEffect(() => {
    const resize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  return <div className="h-full w-full" ref={terminalRef} />
}
