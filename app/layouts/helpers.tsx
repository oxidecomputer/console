import { classed } from '@oxide/util'

import './helpers.css'

export const PageContainer = classed.div`grid h-screen grid-cols-[13.75rem,1fr]`
export const Sidebar = classed.div`overflow-auto border-r bg-default border-secondary`
export const ContentPaneWrapper = classed.div`flex flex-col overflow-auto`
export const ContentPane = classed.div`ox-content-pane`
export const ContentPaneActions = classed.div`ox-content-pane-actions`
