import React from 'react'
import Chart from 'react-chartjs-2'

export default function InstanceMetrics() {
  return (
    <div className="mt-16 w-[32rem] h-96">
      <Chart
        type="line"
        data={{
          labels: [
            '9:50',
            '10:00',
            '10:10',
            '10:20',
            '10:30',
            '10:40',
            '10:50',
          ],
          datasets: [
            {
              label: 'Cap',
              data: [600, 600, 600, 600, 800, 800, 800],
              borderColor: '#48D597',
              borderDash: [4, 4],
              borderWidth: 1,
              pointRadius: 0,
              stepped: 'after',
            },
            {
              label: 'Utilization',
              data: [200, 300, 500, 450, 650, 550, 600],
              fill: true,
              backgroundColor: '#112725',
              borderColor: '#2F8865',
              borderWidth: 1,
              // need the points to get the tooltip on hover. maybe you can make them invisible
              // pointStyle: 'rect',
              pointRadius: 0,
            },
          ],
        }}
        options={{
          scales: {
            y: {
              position: 'right',
              grid: {
                color: '#1D2427',
                borderColor: '#353C3E',
                drawTicks: false,
              },
            },
            x: {
              grid: {
                borderColor: '#353C3E',
                drawTicks: true,
              },
            },
          },
        }}
      />
    </div>
  )
}
