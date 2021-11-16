import React from 'react'
import { VictoryChart } from 'victory-chart'
import { VictoryArea } from 'victory-area'
import { VictoryLine } from 'victory-line'

const data = [
  { x: '9:50', y: 200 },
  { x: '10:00', y: 300 },
  { x: '10:10', y: 500 },
  { x: '10:20', y: 450 },
  { x: '10:30', y: 650 },
  { x: '10:40', y: 550 },
  { x: '10:50', y: 600 },
]

const capData = [
  { x: '9:50', y: 600 },
  { x: '10:00', y: 600 },
  { x: '10:10', y: 600 },
  { x: '10:20', y: 600 },
  { x: '10:30', y: 800 },
  { x: '10:40', y: 800 },
  { x: '10:50', y: 800 },
]

export default function InstanceMetrics() {
  return (
    <div style={{ width: 480, height: 360 }}>
      <VictoryChart
        theme={{
          dependentAxis: {
            orientation: 'right',
            style: {
              grid: { stroke: '#1D2427' },
              tickLabels: { fill: '#ccc' },
              axis: { stroke: '#1D2427' },
            },
          },
          independentAxis: {
            style: {
              grid: { stroke: 'none' },
              tickLabels: { fill: '#ccc' },
              axis: { stroke: '#1D2427' },
            },
          },
        }}
      >
        <VictoryArea
          data={data}
          style={{ data: { fill: '#112725', stroke: '#2F8865' } }}
        />
        <VictoryLine
          data={capData}
          style={{
            data: { stroke: '#48D597', strokeWidth: 1, strokeDasharray: '4,4' },
          }}
          interpolation="stepBefore"
        />
      </VictoryChart>
    </div>
  )
}
