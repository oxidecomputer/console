import { useEffect, useRef, useState } from 'react'
import type { ITerminalAddon, ITerminalOptions } from 'xterm'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface TerminalProps {
  data?: number[]
  className?: string
}

const options: ITerminalOptions = {
  allowTransparency: false,
  screenReaderMode: true,
  rendererType: 'dom',
  fontFamily: '"GT America Mono", monospace',
  fontSize: 14,
  lineHeight: 1.2,
  minimumContrastRatio: 21,
  windowOptions: {
    fullscreenWin: true,
    refreshWin: true,
  },
}

export const Terminal = ({ data, className }: TerminalProps) => {
  const [term, setTerm] = useState<XTerm | null>(null)
  const terminalRef = useRef(null)

  useEffect(() => {
    const style = getComputedStyle(document.body)
    const newTerm = new XTerm({
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

    // Persist terminal instance, initialize terminal
    setTerm(newTerm)
    if (terminalRef.current) {
      newTerm.open(terminalRef.current)
    }

    // Setup terminal addons
    const fitAddon = new FitAddon()
    const addons: ITerminalAddon[] = [fitAddon]
    for (const addon of addons) {
      newTerm.loadAddon(addon)
    }
    // Handle window resizing
    const resize = () => {
      fitAddon.fit()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      newTerm.dispose()
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (data) {
      term?.clear()
      term?.write(new Uint8Array(data))
    }
  }, [term, data])

  return <div className={className} ref={terminalRef} />
}

export default Terminal
