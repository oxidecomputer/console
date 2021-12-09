import './helpers.css'
import React from 'react'
import cn from 'classnames'
import { PaginationProvider } from '@oxide/pagination'

type Div = React.FC<JSX.IntrinsicElements['div']>

export const PageContainer: Div = ({ className, children, ...props }) => (
  <div className={cn('ox-page-container', className)} {...props}>
    <PaginationProvider>{children}</PaginationProvider>
  </div>
)

export const Sidebar: Div = ({ className, ...props }) => (
  <div className={cn('ox-sidebar', className)} {...props} />
)
export const ContentPane: Div = ({ className, ...props }) => (
  <div className={cn('ox-content-pane', className)} {...props} />
)
export const PaginationContainer: Div = ({ className, ...props }) => (
  <div className={cn('ox-pagination-container', className)} {...props} />
)
