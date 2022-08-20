import tunnel from 'tunnel-rat'

const Tunnel = tunnel('page-actions')

export const PageActions = Tunnel.In
export const PageActionsTarget = Tunnel.Out
