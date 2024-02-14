/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export const sledSize = { x: 550, y: 100, z: 265 }
export const normalizedSledSize = {
  x: 1,
  y: sledSize.y / sledSize.x,
  z: sledSize.z / sledSize.x,
}

export const rackSize = {
  x: normalizedSledSize.x,
  y: normalizedSledSize.y * 18,
  z: normalizedSledSize.z * 2,
}

export const sizeMultiplier = sledSize.x / normalizedSledSize.x

export const rackOrigin = [
  0,
  rackSize.y / 2 - normalizedSledSize.y / 2,
  normalizedSledSize.z / 2,
]

// Calculate the position for each Sled based on its index
export function getSledPosition(index: number) {
  const row = Math.floor(index / 2)
  const column = index % 2
  const yOffset = index > 15 ? normalizedSledSize.y * 2 : 0
  return [
    0 - rackOrigin[0],
    row * normalizedSledSize.y - rackOrigin[1] + yOffset,
    column * normalizedSledSize.z - rackOrigin[2],
  ]
}

// sensorType: [healthyMax, healthyMax, unhealthy]
export const temperatureRanges = {
  cpu: [30, 70, 85],
  u2: [0, 60, 70],
  m2: [0, 60, 70],
  air: [20, 40, 45],
  dimm: [20, 45, 60],
} as const

type SensorTypeKeys = keyof typeof temperatureRanges

export type Sensor = {
  label: string
  position: { x: number; y: number; z: number }
  size: { x: number; y: number; z: number }
  type: SensorTypeKeys
}

export const sensors: Sensor[] = [
  {
    label: 'Southwest',
    position: { x: 120, y: 5, z: 45 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'South',
    position: { x: 120, y: 5, z: 120 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'Southeast',
    position: { x: 120, y: 5, z: 190 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'Northwest',
    position: { x: 445, y: 5, z: 40 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'North',
    position: { x: 445, y: 5, z: 120 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'Northeast',
    position: { x: 445, y: 5, z: 190 },
    type: 'air',
    size: { x: 5, y: 15, z: 10 },
  },
  {
    label: 'U2_N0',
    position: { x: 20, y: 4, z: 10 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N1',
    position: { x: 20, y: 4, z: 35 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N2',
    position: { x: 20, y: 4, z: 60 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N3',
    position: { x: 20, y: 4, z: 85 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N4',
    position: { x: 20, y: 4, z: 110 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N5',
    position: { x: 20, y: 4, z: 135 },
    size: { x: 60, y: 80, z: 15 },

    type: 'u2',
  },
  {
    label: 'U2_N6',
    position: { x: 20, y: 4, z: 160 },
    size: { x: 60, y: 80, z: 15 },
    type: 'u2',
  },
  {
    label: 'U2_N7',
    position: { x: 20, y: 4, z: 185 },
    size: { x: 60, y: 80, z: 15 },
    type: 'u2',
  },
  {
    label: 'U2_N8',
    position: { x: 20, y: 4, z: 210 },
    size: { x: 60, y: 80, z: 15 },
    type: 'u2',
  },
  {
    label: 'U2_N9',
    position: { x: 20, y: 4, z: 235 },
    size: { x: 60, y: 80, z: 15 },
    type: 'u2',
  },
  {
    label: 'CPU',
    position: { x: 190, y: 4, z: 93 },
    size: { x: 80, y: 3, z: 62.5 },
    type: 'cpu',
  },
  {
    label: 'DIMM_D1',
    position: { x: 160, y: 4, z: 16 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_D0',
    position: { x: 160, y: 4, z: 24 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_C1',
    position: { x: 160, y: 4, z: 32 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_C0',
    position: { x: 160, y: 4, z: 40 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_B1',
    position: { x: 160, y: 4, z: 48 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_B0',
    position: { x: 160, y: 4, z: 56 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_A1',
    position: { x: 160, y: 4, z: 64 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_A0',
    position: { x: 160, y: 4, z: 72 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_E0',
    position: { x: 160, y: 4, z: 180 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_E1',
    position: { x: 160, y: 4, z: 188 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_F0',
    position: { x: 160, y: 4, z: 196 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_F1',
    position: { x: 160, y: 4, z: 204 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_G0',
    position: { x: 160, y: 4, z: 212 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_G1',
    position: { x: 160, y: 4, z: 220 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_H0',
    position: { x: 160, y: 4, z: 228 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_H1',
    position: { x: 160, y: 4, z: 236 },
    size: { x: 142, y: 30, z: 2 },
    type: 'dimm',
  },
  {
    label: 'T6',
    position: { x: 490, y: 4, z: 100 },
    size: { x: 33, y: 4, z: 33 },
    type: 'cpu',
  },
  {
    label: 'M2_A',
    position: { x: 340, y: 4, z: 12 },
    size: { x: 20, y: 4, z: 115 },
    type: 'm2',
  },
  {
    label: 'M2_B',
    position: { x: 340, y: 4, z: 140 },
    size: { x: 20, y: 4, z: 115 },
    type: 'm2',
  },
]

export type SensorValues = Record<string, number>

export function generateMockSensorData() {
  const mockData: SensorValues = {}

  sensors.forEach((sensor) => {
    const range = temperatureRanges[sensor.type]
    const normalMin = range[0]
    const normalMax = range[1]
    const unhealthy = range[2]

    // Determine the center of the normal range
    const normalCenter = (normalMin + normalMax) / 2

    // Randomly decide the value category
    const rand = Math.random()
    let value

    // Center of normal
    let fluctuation = (normalMax - normalMin) * 0.1 * Math.random() // 10% of the normal range
    fluctuation = fluctuation / 2 + fluctuation
    if (rand < 1 / 50) {
      // Close to unhealthy
      value = unhealthy - (unhealthy - normalMax) * (0.1 * Math.random()) + fluctuation
    } else if (rand < 1 / 25) {
      // On the higher end of normal
      value = normalMax - (normalMax - normalCenter) * (0.25 * Math.random()) + fluctuation
    } else {
      value = normalCenter + fluctuation
    }

    mockData[sensor.label] = Math.round(value * 100) / 100
  })

  return mockData
}

export function walkSensorValues(sensorValues: SensorValues): SensorValues {
  const walkedValues: SensorValues = {}

  Object.entries(sensorValues).forEach(([label, value]) => {
    const sensor = sensors.find((s) => s.label === label)
    const tRange = sensor ? temperatureRanges[sensor.type] : [30, 50, 80]
    const midpoint = (tRange[0] + tRange[1]) / 2

    // Adjust the probability of direction based on how far the value
    // is from the midpoint of healthy and unhealthy values
    const distanceFromMidpoint = midpoint - value

    // We influence the probability that we are positively or negatively
    // offsetting the temperature value based on how far we are from the midpoint
    // of temperature ranges – that way we stay more or less within normal ranges
    const probabilityModifier = distanceFromMidpoint / 500
    const randomFactor = Math.random()
    let direction
    if (value < tRange[0]) {
      direction = 1
    } else if (value > tRange[1]) {
      direction = -1
    } else {
      direction = randomFactor < 0.5 - probabilityModifier / 2 ? 1 : -1
    }

    walkedValues[label] = Math.round((value + direction * Math.random()) * 100) / 100
  })

  return walkedValues
}

export function generateSensorValuesArray(
  initialSensorValues: SensorValues,
  steps = 200
): SensorValues[] {
  let currentSensorValues = initialSensorValues
  const sensorValuesArray: SensorValues[] = []

  for (let i = 0; i < steps; i++) {
    currentSensorValues = walkSensorValues(currentSensorValues)
    sensorValuesArray.push(currentSensorValues)
  }

  return sensorValuesArray
}

export const sensorValues: SensorValues = generateMockSensorData()
