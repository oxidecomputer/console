import { classed } from '@oxide/ui'

export const PageContainer = classed.div`grid h-screen grid-cols-[14rem,auto]`
export const Sidebar = classed.div`pb-6 pt-6 overflow-auto bg-gray-800 border-r border-gray-450 px-3`
export const ContentPane = classed.div`overflow-auto pt-14 pb-2 grid grid-cols-[2.5rem,auto,2.5rem] children:grid-col-2 auto-rows-min`
