import { useEffect, useRef, useState } from 'react'
import type { ITerminalOptions } from 'xterm'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

import { DirectionDownIcon, DirectionUpIcon } from '@oxide/ui'
import { classed } from '@oxide/util'

interface TerminalProps {
  data?: number[]
}

const options: ITerminalOptions = {
  allowTransparency: false,
  screenReaderMode: true,
  fontFamily: '"GT America Mono", monospace',
  fontSize: 13,
  lineHeight: 1.2,
  windowOptions: {
    fullscreenWin: true,
    refreshWin: true,
  },
}

const ScrollButton = classed.button`ml-4 flex h-8 w-8 items-center justify-center rounded border border-secondary hover:bg-hover`

function getTheme() {
  const style = getComputedStyle(document.body)
  return {
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
  }
}

export const Terminal = ({ data }: TerminalProps) => {
  const [term, setTerm] = useState<XTerm | null>(null)
  const terminalRef = useRef(null)

  useEffect(() => {
    const newTerm = new XTerm({ theme: getTheme(), ...options })

    // Persist terminal instance, initialize terminal
    setTerm(newTerm)
    if (terminalRef.current) {
      newTerm.open(terminalRef.current)
    }

    // Setup terminal addons
    const fitAddon = new FitAddon()
    newTerm.loadAddon(fitAddon)

    // Handle window resizing
    const resize = () => fitAddon.fit()

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

  return (
    <>
      <div className="h-full w-[calc(100%-3rem)]" ref={terminalRef} />
      <div className="absolute right-0 top-0 space-y-2 text-secondary">
        <ScrollButton onClick={() => term?.scrollToTop()}>
          <DirectionUpIcon />
        </ScrollButton>
        <ScrollButton onClick={() => term?.scrollToBottom()}>
          <DirectionDownIcon />
        </ScrollButton>
      </div>
    </>
  )
}

export default Terminal
