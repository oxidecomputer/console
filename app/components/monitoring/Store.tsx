import { create } from 'zustand'

interface MonitoringState {
  fitSled: (index: number) => void
  setFitSledFn: (fn: (index: number) => void) => void
  fitRack: () => void
  setFitRackFn: (fn: () => void) => void
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  fitSled: () => {},
  setFitSledFn: (fn) => set(() => ({ fitSled: fn })),
  fitRack: () => {},
  setFitRackFn: (fn) => set(() => ({ fitRack: fn })),
}))
