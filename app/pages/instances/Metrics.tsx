import React from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'

const data = [
  { name: '9:50', amt: 200, limit: 600 },
  { name: '10:00', amt: 300, limit: 600 },
  { name: '10:10', amt: 500, limit: 600 },
  { name: '10:20', amt: 450, limit: 600 },
  { name: '10:30', amt: 650, limit: 800 },
  { name: '10:40', amt: 550, limit: 800 },
  { name: '10:50', amt: 600, limit: 800 },
]

export default function InstanceMetrics() {
  return (
    <ComposedChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      className="mt-16"
    >
      {/* TODO: pull these colors from TW config */}
      <CartesianGrid stroke="#1D2427" vertical={false} />
      <Area
        dataKey="amt"
        stroke="#2F8865"
        fillOpacity={1}
        fill="#112725"
        isAnimationActive={false}
      />
      <Line
        dataKey="limit"
        stroke="#48D597"
        strokeDasharray="3 3"
        dot={false}
        type="stepBefore"
        isAnimationActive={false}
      />
      <XAxis dataKey="name" />
      <YAxis orientation="right" />
    </ComposedChart>
  )
}
