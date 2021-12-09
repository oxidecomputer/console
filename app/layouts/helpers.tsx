import './helpers.css'
import React from 'react'
import cn from 'classnames'
import { PaginationProvider } from '@oxide/pagination'
import { classed } from '@oxide/ui'

type Div = React.FC<JSX.IntrinsicElements['div']>

export const PageContainer: Div = ({ className, children, ...props }) => (
  <div className={cn('ox-page-container', className)} {...props}>
    <PaginationProvider>{children}</PaginationProvider>
  </div>
)

export const Sidebar = classed.div`ox-sidebar`
export const ContentPane = classed.div`ox-content-pane`
export const PaginationContainer = classed.div`ox-pagination-container`
