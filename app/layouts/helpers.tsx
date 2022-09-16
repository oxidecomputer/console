import { classed } from '@oxide/util'

export const PageContainer = classed.div`grid h-screen grid-cols-[13.75rem,1fr]`
export const Content = classed.main`[&>*]:gutter`
export const ContentPaneWrapper = classed.div`flex flex-col overflow-auto`
export const ContentPane = classed.div`ox-content-pane relative flex flex-grow flex-col pb-10`
export const ContentPaneActions = classed.div`sticky bottom-0 flex-shrink-0 justify-between overflow-hidden bg-default border-t border-secondary empty:border-t-0`
