/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm, type ITerminalOptions } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

import { DirectionDownIcon, DirectionUpIcon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

import { AttachAddon } from './AttachAddon'

const ScrollButton = classed.button`ml-4 flex h-8 w-8 items-center justify-center rounded border border-secondary hover:bg-hover`

function getOptions(): ITerminalOptions {
  const style = getComputedStyle(document.body)
  return {
    // it is not easy to figure out what the exact behavior is when scrollback
    // is not defined because it seems to be used in a bunch of places in the
    // xterm.js codebase. My best guess is that it defaults to 1000, based on
    // the linked line. For now our approach is to go pretty big and see if
    // performance is tolerable.
    // https://github.com/xtermjs/xterm.js/blob/a0493a604c/src/common/services/OptionsService.ts#L30C1
    scrollback: 5000,
    allowTransparency: false,
    screenReaderMode: true,
    fontFamily: '"GT America Mono", monospace',
    fontSize: 13,
    lineHeight: 1.2,
    windowOptions: {
      fullscreenWin: true,
      refreshWin: true,
    },
    theme: {
      background: style.getPropertyValue('--surface-default'),
      foreground: style.getPropertyValue('--content-default'),
      black: style.getPropertyValue('--surface-default'),
      brightBlack: style.getPropertyValue('--content-quinary'),
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
      cursorAccent: style.getPropertyValue('--surface-default'),
    },
  }
}

interface TerminalProps {
  ws: WebSocket
}

// default export is most convenient for dynamic import
// eslint-disable-next-line import/no-default-export
export default function Terminal({ ws }: TerminalProps) {
  const [term, setTerm] = useState<XTerm | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newTerm = new XTerm(getOptions())

    // TODO: the render triggered by this call is load-bearing and should not
    // be. Moving initialization out to a useMemo like it should be
    //
    //   const term = useMemo(() => new XTerm(getOptions()), [])
    //
    // introduces a bug where the serial console text does not show up until you
    // click the terminal area or resize the window. It cannot be about making
    // this effect run again, because the deps don't include newTerm. It must be
    // something internal to XTerm. Overall I do not feel particularly good
    // about this whole section.
    setTerm(newTerm)

    const fitAddon = new FitAddon()
    newTerm.loadAddon(fitAddon)
    newTerm.loadAddon(new AttachAddon(ws))

    // Handle window resizing
    const resize = () => fitAddon.fit()

    // ref will always be defined by the time the effect runs, but make TS happy
    if (terminalRef.current) {
      newTerm.open(terminalRef.current)
      resize()
    }

    window.addEventListener('resize', resize)
    return () => {
      newTerm.dispose()
      window.removeEventListener('resize', resize)
    }
  }, [ws])

  return (
    <>
      <div className="h-full w-[calc(100%-3rem)] text-mono-code" ref={terminalRef} />
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
