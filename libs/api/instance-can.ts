import type { ApiInstanceView } from './__generated__'

export const instanceCan: Record<string, (i: ApiInstanceView) => boolean> = {
  reboot: (i) => i.runState === 'running',
  stop: (i) => i.runState === 'running',
  delete: (i) => i.runState === 'stopped',
}
