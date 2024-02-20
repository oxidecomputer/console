/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export const sledSize = { x: 55.0, y: 10.0, z: 26.5 }
export const normalizedSledSize = {
  x: 1,
  y: sledSize.y / sledSize.x,
  z: sledSize.z / sledSize.x,
}

export const rackSize = {
  x: sledSize.x,
  y: sledSize.y * 18,
  z: sledSize.z * 2,
}

export const normalizedRackSize = {
  x: rackSize.x / rackSize.y,
  y: 1,
  z: rackSize.z / rackSize.y,
}

export const sizeMultiplier = sledSize.x / normalizedSledSize.x

export const rackOrigin = [rackSize.x / 2, rackSize.y / 2, rackSize.z / 2]

// Calculate the position for each Sled based on its index
export function getSledPosition(index: number) {
  const row = Math.floor(index / 2)
  const column = index % 2
  const yOffset = index > 15 ? sledSize.y * 2 : 0
  return [
    0,
    row * sledSize.y + sledSize.y / 2 + yOffset,
    column * sledSize.z - rackOrigin[2] / 2,
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
    position: { x: 12, y: 0.5, z: 4.5 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'South',
    position: { x: 12, y: 0.5, z: 12 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'Southeast',
    position: { x: 12, y: 0.5, z: 19 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'Northwest',
    position: { x: 44.5, y: 0.5, z: 4 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'North',
    position: { x: 44.5, y: 0.5, z: 12 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'Northeast',
    position: { x: 44.5, y: 0.5, z: 19 },
    type: 'air',
    size: { x: 0.5, y: 1.5, z: 1 },
  },
  {
    label: 'U2_N0',
    position: { x: 2, y: 0.8, z: 1 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N1',
    position: { x: 2, y: 0.8, z: 3.5 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N2',
    position: { x: 2, y: 0.8, z: 6 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N3',
    position: { x: 2, y: 0.8, z: 8.5 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N4',
    position: { x: 2, y: 0.8, z: 11 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N5',
    position: { x: 2, y: 0.8, z: 13.5 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N6',
    position: { x: 2, y: 0.8, z: 16 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N7',
    position: { x: 2, y: 0.8, z: 18.5 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N8',
    position: { x: 2, y: 0.8, z: 21 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'U2_N9',
    position: { x: 2, y: 0.8, z: 23.5 },
    size: { x: 6, y: 8, z: 1.5 },
    type: 'u2',
  },
  {
    label: 'CPU',
    position: { x: 19, y: 0.8, z: 9.3 },
    size: { x: 8, y: 0.3, z: 6.25 },
    type: 'cpu',
  },
  {
    label: 'DIMM_D1',
    position: { x: 16, y: 0.8, z: 1.6 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_D0',
    position: { x: 16, y: 0.8, z: 2.4 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_C1',
    position: { x: 16, y: 0.8, z: 3.2 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_C0',
    position: { x: 16, y: 0.8, z: 4 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_B1',
    position: { x: 16, y: 0.8, z: 4.8 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_B0',
    position: { x: 16, y: 0.8, z: 5.6 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_A1',
    position: { x: 16, y: 0.8, z: 6.4 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_A0',
    position: { x: 16, y: 0.8, z: 7.2 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_E0',
    position: { x: 16, y: 0.8, z: 18 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_E1',
    position: { x: 16, y: 0.8, z: 18.8 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_F0',
    position: { x: 16, y: 0.8, z: 19.6 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_F1',
    position: { x: 16, y: 0.8, z: 20.8 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_G0',
    position: { x: 16, y: 0.8, z: 21.2 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_G1',
    position: { x: 16, y: 0.8, z: 22 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_H0',
    position: { x: 16, y: 0.8, z: 22.8 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'DIMM_H1',
    position: { x: 16, y: 0.8, z: 23.6 },
    size: { x: 14.2, y: 3, z: 0.2 },
    type: 'dimm',
  },
  {
    label: 'T6',
    position: { x: 49, y: 0.8, z: 10 },
    size: { x: 3.3, y: 0.8, z: 3.3 },
    type: 'cpu',
  },
  {
    label: 'M2_A',
    position: { x: 34, y: 0.8, z: 1.2 },
    size: { x: 2, y: 0.8, z: 11.5 },
    type: 'm2',
  },
  {
    label: 'M2_B',
    position: { x: 34, y: 0.8, z: 14 },
    size: { x: 2, y: 0.8, z: 11.5 },
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
