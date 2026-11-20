/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'

/** The sticky footer element at the bottom of `ContentPane` */
const useFooter = create<{ el: HTMLElement | null }>(() => ({ el: null }))

/** Ref callback for the footer element */
export const setPageFooter = (el: HTMLElement | null) => useFooter.setState({ el })

/**
 * Render page-level buttons or pagination in the sticky footer at the bottom
 * of the content pane, outside the page's scrolling content.
 */
export function PageFooter({ children }: { children: ReactNode }) {
  const footer = useFooter((s) => s.el)
  // null on the first render of a ContentPane, before the footer has mounted
  return footer && createPortal(children, footer)
}
