import * as RTabs from '@radix-ui/react-tabs'
import cn from 'classnames'

import './Tabs.css'

interface TabsProps extends RTabs.TabsProps {
  id: string
  fullWidth?: boolean
  className?: string
}

export function Tabs({ fullWidth, children, className, ...props }: TabsProps) {
  return (
    <RTabs.Root
      {...props}
      className={cn(className, 'ox-tabs', { 'full-width': fullWidth })}
    >
      {children}
    </RTabs.Root>
  )
}

Tabs.Trigger = function TabsTrigger({
  className,
  children,
  ...props
}: RTabs.TabsTriggerProps) {
  return (
    <RTabs.Trigger className={cn('ox-tab', className)} {...props}>
      <div>{children}</div>
    </RTabs.Trigger>
  )
}

Tabs.List = function TabsList({ className, children, ...props }: RTabs.TabsListProps) {
  return (
    <RTabs.List className={cn('ox-tabs-list', className)} {...props}>
      {children}
    </RTabs.List>
  )
}

Tabs.Content = function TabsContent({
  children,
  className,
  ...props
}: RTabs.TabsContentProps) {
  return (
    <RTabs.Content className={cn('ox-tab-panel ox-tabs-panel', className)} {...props}>
      {children}
    </RTabs.Content>
  )
}
