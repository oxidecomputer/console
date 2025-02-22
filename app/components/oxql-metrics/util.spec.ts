/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import type { OxqlQueryResult } from '~/api'

import {
  composeOxqlData,
  getLargestValue,
  getMaxExponent,
  getMeanWithinSeconds,
  getTimePropsForOxqlQuery,
  getTimestamps,
  getUnit,
  getUtilizationChartProps,
  oxqlTimestamp,
  sumValues,
  yAxisLabelForCountChart,
} from './util'

test('oxqlTimestamp', () => {
  const date1 = new Date('2025-02-11T00:00:01.234Z')
  expect(oxqlTimestamp(date1)).toEqual('2025-02-11T00:00:01.000')
  const datePST = new Date('2025-02-11T00:00:00-08:00')
  expect(oxqlTimestamp(datePST)).toEqual('2025-02-11T08:00:00.000')
})

describe('getMeanWithinSeconds', () => {
  const start = new Date('2025-02-11T00:00:00Z')
  test('calculates the mean window for a 10-minute range', () => {
    const end = new Date('2025-02-11T00:10:00Z') // 10 minutes later
    expect(getMeanWithinSeconds(start, end)).toBe(10)
  })

  test('calculates the mean window for a 1-hour range', () => {
    const end = new Date('2025-02-11T01:00:00Z') // 60 minutes later
    expect(getMeanWithinSeconds(start, end)).toBe(60)
  })

  test('calculates the mean window for a 24-hour range', () => {
    const end = new Date('2025-02-12T00:00:00Z') // 24 hours later
    expect(getMeanWithinSeconds(start, end)).toBe(1440)
  })

  test('calculates the mean window for a 1-week range', () => {
    const end = new Date('2025-02-18T00:00:00Z') // 1 week later
    expect(getMeanWithinSeconds(start, end)).toBe(10080)
  })

  test('calculates the mean window for a 10-minute range, but with only 5 datapoints', () => {
    const end = new Date('2025-02-11T00:10:00Z') // 10 minutes later
    const datapoints = 5
    expect(getMeanWithinSeconds(start, end, datapoints)).toBe(120)
  })
  test('calculates the mean window for a 2-hour range, but with only 5 datapoints', () => {
    const end = new Date('2025-02-11T02:00:00Z') // 120 minutes later
    const datapoints = 5
    expect(getMeanWithinSeconds(start, end, datapoints)).toBe(1440)
  })
  test('calculates the mean window for a 1-month range', () => {
    const end = new Date('2025-03-11T00:00:00Z') // 28 days later
    expect(getMeanWithinSeconds(start, end)).toBe(40320)
  })
  test('calculates the mean window for a 1-month range, with only 20 datapoints', () => {
    const end = new Date('2025-03-11T00:00:00Z') // 28 days later
    expect(getMeanWithinSeconds(start, end, 20)).toBe(120960)
  })
})

test('getTimePropsForOxqlQuery', () => {
  const startTime = new Date('2025-02-21T01:00:00Z')
  const endTime = new Date('2025-02-21T02:00:00Z')
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  expect(meanWithinSeconds).toEqual(60)
  expect(adjustedStart).toEqual(new Date('2025-02-21T00:58:00.000Z'))
})

test('getMaxExponent', () => {
  expect(getMaxExponent(5, 1000)).toEqual(0)
  expect(getMaxExponent(1000, 1000)).toEqual(1)
  expect(getMaxExponent(1001, 1000)).toEqual(1)
  expect(getMaxExponent(10 ** 6, 1000)).toEqual(2)
  expect(getMaxExponent(10 ** 6 + 1, 1000)).toEqual(2)
  expect(getMaxExponent(10 ** 9, 1000)).toEqual(3)
  expect(getMaxExponent(10 ** 9 + 1, 1000)).toEqual(3)

  // Bytes
  expect(getMaxExponent(5, 1024)).toEqual(0)
  // KiBs
  expect(getMaxExponent(1024, 1024)).toEqual(1)
  expect(getMaxExponent(1025, 1024)).toEqual(1)
  expect(getMaxExponent(2 ** 20 - 1, 1024)).toEqual(1)
  // MiBs
  expect(getMaxExponent(2 ** 20, 1024)).toEqual(2)
  expect(getMaxExponent(2 ** 20 + 1, 1024)).toEqual(2)
  expect(getMaxExponent(2 ** 30 - 1, 1024)).toEqual(2)
  // GiBs
  expect(getMaxExponent(2 ** 30, 1024)).toEqual(3)
  expect(getMaxExponent(2 ** 30 + 1, 1024)).toEqual(3)

  expect(getMaxExponent(0, 1000)).toEqual(0)
})

test('yAxisLabelForCountChart', () => {
  expect(yAxisLabelForCountChart(5, 0)).toEqual('5')
  expect(yAxisLabelForCountChart(1000, 1)).toEqual('1k')
  expect(yAxisLabelForCountChart(1001, 1)).toEqual('1k')
  expect(yAxisLabelForCountChart(10 ** 6, 2)).toEqual('1M')
  expect(yAxisLabelForCountChart(10 ** 6 + 1, 2)).toEqual('1M')
  expect(yAxisLabelForCountChart(10 ** 9, 3)).toEqual('1B')
  expect(yAxisLabelForCountChart(10 ** 9 + 1, 3)).toEqual('1B')
  expect(yAxisLabelForCountChart(10 ** 12, 4)).toEqual('1T')
  expect(yAxisLabelForCountChart(10 ** 12 + 1, 4)).toEqual('1T')
})

test('getUnit', () => {
  expect(getUnit('CPU Utilization')).toEqual('%')
  expect(getUnit('Bytes Read')).toEqual('Bytes')
  expect(getUnit('Disk reads')).toEqual('Count')
  expect(getUnit('Anything else')).toEqual('Count')
})

test('getLargestValue', () => {
  const sampleData = [
    { timestamp: 1739232000000, value: 5 },
    { timestamp: 1739232060000, value: 10 },
    { timestamp: 1739232120000, value: 15 },
  ]
  expect(getLargestValue(sampleData)).toEqual(15)
  expect(getLargestValue([])).toEqual(0)
})

const mockUtilizationQueryResult1: OxqlQueryResult = {
  tables: [
    {
      name: 'virtual_machine:vcpu_usage',
      timeseries: {
        '16671618930358432507': {
          fields: {
            vcpuId: {
              type: 'u32',
              value: 0,
            },
          },
          points: {
            timestamps: [
              new Date('2025-02-21T19:28:43Z'),
              new Date('2025-02-21T19:29:43Z'),
              new Date('2025-02-21T19:30:43Z'),
              new Date('2025-02-21T19:31:43Z'),
              new Date('2025-02-21T19:32:43Z'),
              new Date('2025-02-21T19:33:43Z'),
              new Date('2025-02-21T19:34:43Z'),
              new Date('2025-02-21T19:35:43Z'),
              new Date('2025-02-21T19:36:43Z'),
              new Date('2025-02-21T19:37:43Z'),
              new Date('2025-02-21T19:38:43Z'),
              new Date('2025-02-21T19:39:43Z'),
              new Date('2025-02-21T19:40:43Z'),
              new Date('2025-02-21T19:41:43Z'),
              new Date('2025-02-21T19:42:43Z'),
              new Date('2025-02-21T19:43:43Z'),
              new Date('2025-02-21T19:44:43Z'),
              new Date('2025-02-21T19:45:43Z'),
              new Date('2025-02-21T19:46:43Z'),
              new Date('2025-02-21T19:47:43Z'),
              new Date('2025-02-21T19:48:43Z'),
              new Date('2025-02-21T19:49:43Z'),
              new Date('2025-02-21T19:50:43Z'),
              new Date('2025-02-21T19:51:43Z'),
              new Date('2025-02-21T19:52:43Z'),
              new Date('2025-02-21T19:53:43Z'),
              new Date('2025-02-21T19:54:43Z'),
              new Date('2025-02-21T19:55:43Z'),
              new Date('2025-02-21T19:56:43Z'),
              new Date('2025-02-21T19:57:43Z'),
              new Date('2025-02-21T19:58:43Z'),
              new Date('2025-02-21T19:59:43Z'),
              new Date('2025-02-21T20:00:43Z'),
              new Date('2025-02-21T20:01:43Z'),
              new Date('2025-02-21T20:02:43Z'),
              new Date('2025-02-21T20:03:43Z'),
              new Date('2025-02-21T20:04:43Z'),
              new Date('2025-02-21T20:05:43Z'),
              new Date('2025-02-21T20:06:43Z'),
              new Date('2025-02-21T20:07:43Z'),
              new Date('2025-02-21T20:08:43Z'),
              new Date('2025-02-21T20:09:43Z'),
              new Date('2025-02-21T20:10:43Z'),
              new Date('2025-02-21T20:11:43Z'),
              new Date('2025-02-21T20:12:43Z'),
              new Date('2025-02-21T20:13:43Z'),
              new Date('2025-02-21T20:14:43Z'),
              new Date('2025-02-21T20:15:43Z'),
              new Date('2025-02-21T20:16:43Z'),
              new Date('2025-02-21T20:17:43Z'),
              new Date('2025-02-21T20:18:43Z'),
              new Date('2025-02-21T20:19:43Z'),
              new Date('2025-02-21T20:20:43Z'),
              new Date('2025-02-21T20:21:43Z'),
              new Date('2025-02-21T20:22:43Z'),
              new Date('2025-02-21T20:23:43Z'),
              new Date('2025-02-21T20:24:43Z'),
              new Date('2025-02-21T20:25:43Z'),
              new Date('2025-02-21T20:26:43Z'),
              new Date('2025-02-21T20:27:43Z'),
              new Date('2025-02-21T20:28:43Z'),
              new Date('2025-02-21T20:29:43Z'),
            ],
            values: [
              {
                values: {
                  type: 'double',
                  values: [
                    4991154550.953981, 5002306111.529594, 5005747970.58788,
                    4996292893.584528, 4998050968.850756, 5004789144.090651,
                    4993214810.150828, 5000464185.201564, 5001669934.944093,
                    5001497083.202703, 5001011172.672396, 4992008144.654252,
                    5001831380.890524, 5001924806.276582, 5000916037.925857,
                    5002960670.484395, 4996184711.242969, 5000408631.826216,
                    5001631112.771454, 4998643337.888756, 4997817860.921065,
                    4996502887.860745, 4999178998.162529, 4994865192.767912,
                    5005724862.797634, 4999589122.343746, 5007221017.048959,
                    4996445205.790302, 5000366399.336565, 4999095693.988176,
                    4996619332.9898, 4993659092.807705, 5009543189.323464,
                    4994787455.051904, 4993292628.398588, 5009871829.741958,
                    5002778061.339198, 4999817422.413484, 4994998220.218649,
                    4997729058.293921, 5004827623.343801, 4995786421.375828,
                    5002188834.540807, 5000390248.439431, 4994598636.529923,
                    4993232474.252971, 5015096657.077068, 4995845911.9815035,
                    5002761273.34156, 4995737637.523023, 4991925780.139541,
                    5010169320.08084, 4993772659.0981, 5005649892.409724, 5452769628.274348,
                    4994355347.268937, 5005185973.638839, 5001042443.806114,
                    4995978113.541379, 4996046489.761501, 5004127086.180883,
                    4615078611.35084,
                  ],
                },
                metricType: 'gauge',
              },
            ],
          },
        },
      },
    },
  ],
}

const mockTimeseries =
  mockUtilizationQueryResult1.tables[0].timeseries['16671618930358432507']

test('getTimestamps', () => {
  const expectedTimestamps = [
    1740166123000, 1740166183000, 1740166243000, 1740166303000, 1740166363000,
    1740166423000, 1740166483000, 1740166543000, 1740166603000, 1740166663000,
    1740166723000, 1740166783000, 1740166843000, 1740166903000, 1740166963000,
    1740167023000, 1740167083000, 1740167143000, 1740167203000, 1740167263000,
    1740167323000, 1740167383000, 1740167443000, 1740167503000, 1740167563000,
    1740167623000, 1740167683000, 1740167743000, 1740167803000, 1740167863000,
    1740167923000, 1740167983000, 1740168043000, 1740168103000, 1740168163000,
    1740168223000, 1740168283000, 1740168343000, 1740168403000, 1740168463000,
    1740168523000, 1740168583000, 1740168643000, 1740168703000, 1740168763000,
    1740168823000, 1740168883000, 1740168943000, 1740169003000, 1740169063000,
    1740169123000, 1740169183000, 1740169243000, 1740169303000, 1740169363000,
    1740169423000, 1740169483000, 1740169543000, 1740169603000, 1740169663000,
    1740169723000, 1740169783000,
  ]
  expect(getTimestamps(mockTimeseries)).toEqual(expectedTimestamps)
})

test('sumValues', () => {
  expect(sumValues([], 0)).toEqual([])
  expect(sumValues([mockTimeseries], 62)).toEqual([
    4991154550.953981, 5002306111.529594, 5005747970.58788, 4996292893.584528,
    4998050968.850756, 5004789144.090651, 4993214810.150828, 5000464185.201564,
    5001669934.944093, 5001497083.202703, 5001011172.672396, 4992008144.654252,
    5001831380.890524, 5001924806.276582, 5000916037.925857, 5002960670.484395,
    4996184711.242969, 5000408631.826216, 5001631112.771454, 4998643337.888756,
    4997817860.921065, 4996502887.860745, 4999178998.162529, 4994865192.767912,
    5005724862.797634, 4999589122.343746, 5007221017.048959, 4996445205.790302,
    5000366399.336565, 4999095693.988176, 4996619332.9898, 4993659092.807705,
    5009543189.323464, 4994787455.051904, 4993292628.398588, 5009871829.741958,
    5002778061.339198, 4999817422.413484, 4994998220.218649, 4997729058.293921,
    5004827623.343801, 4995786421.375828, 5002188834.540807, 5000390248.439431,
    4994598636.529923, 4993232474.252971, 5015096657.077068, 4995845911.9815035,
    5002761273.34156, 4995737637.523023, 4991925780.139541, 5010169320.08084,
    4993772659.0981, 5005649892.409724, 5452769628.274348, 4994355347.268937,
    5005185973.638839, 5001042443.806114, 4995978113.541379, 4996046489.761501,
    5004127086.180883, 4615078611.35084,
  ])
  // we're just including this dataset twice to show that the numbers are getting added together
  expect(sumValues([mockTimeseries, mockTimeseries], 62)).toEqual([
    9982309101.907963, 10004612223.059189, 10011495941.17576, 9992585787.169056,
    9996101937.701511, 10009578288.181301, 9986429620.301657, 10000928370.403128,
    10003339869.888186, 10002994166.405407, 10002022345.344791, 9984016289.308504,
    10003662761.781048, 10003849612.553164, 10001832075.851713, 10005921340.96879,
    9992369422.485937, 10000817263.652431, 10003262225.542908, 9997286675.777512,
    9995635721.84213, 9993005775.72149, 9998357996.325058, 9989730385.535824,
    10011449725.595268, 9999178244.687492, 10014442034.097918, 9992890411.580605,
    10000732798.67313, 9998191387.976353, 9993238665.9796, 9987318185.61541,
    10019086378.646929, 9989574910.103807, 9986585256.797176, 10019743659.483915,
    10005556122.678396, 9999634844.826967, 9989996440.437298, 9995458116.587843,
    10009655246.687601, 9991572842.751656, 10004377669.081614, 10000780496.878862,
    9989197273.059847, 9986464948.505941, 10030193314.154137, 9991691823.963007,
    10005522546.68312, 9991475275.046045, 9983851560.279081, 10020338640.16168,
    9987545318.1962, 10011299784.819448, 10905539256.548697, 9988710694.537874,
    10010371947.277678, 10002084887.612228, 9991956227.082758, 9992092979.523003,
    10008254172.361767, 9230157222.70168,
  ])
  // and for good measure, we'll include it three times
  expect(sumValues([mockTimeseries, mockTimeseries, mockTimeseries], 62)).toEqual([
    14973463652.861944, 15006918334.588783, 15017243911.763641, 14988878680.753584,
    14994152906.552267, 15014367432.271952, 14979644430.452484, 15001392555.60469,
    15005009804.83228, 15004491249.60811, 15003033518.017187, 14976024433.962757,
    15005494142.671572, 15005774418.829746, 15002748113.777569, 15008882011.453186,
    14988554133.728905, 15001225895.478647, 15004893338.314362, 14995930013.666267,
    14993453582.763195, 14989508663.582237, 14997536994.487587, 14984595578.303736,
    15017174588.392902, 14998767367.031239, 15021663051.146877, 14989335617.370907,
    15001099198.009695, 14997287081.964529, 14989857998.969402, 14980977278.423115,
    15028629567.970394, 14984362365.155712, 14979877885.195765, 15029615489.225872,
    15008334184.017593, 14999452267.240452, 14984994660.655947, 14993187174.881763,
    15014482870.031403, 14987359264.127483, 15006566503.622421, 15001170745.318295,
    14983795909.589771, 14979697422.758911, 15045289971.231205, 14987537735.944511,
    15008283820.024681, 14987212912.569069, 14975777340.418621, 15030507960.24252,
    14981317977.2943, 15016949677.229172, 16358308884.823044, 14983066041.806812,
    15015557920.916515, 15003127331.418343, 14987934340.624138, 14988139469.284504,
    15012381258.54265, 13845235834.052519,
  ])
})

const mockComposedUtilizationData1 = {
  chartData: [
    {
      timestamp: 1740166183000,
      value: 5002306111.529594,
    },
    {
      timestamp: 1740166243000,
      value: 5005747970.58788,
    },
    {
      timestamp: 1740166303000,
      value: 4996292893.584528,
    },
    {
      timestamp: 1740166363000,
      value: 4998050968.850756,
    },
    {
      timestamp: 1740166423000,
      value: 5004789144.090651,
    },
    {
      timestamp: 1740166483000,
      value: 4993214810.150828,
    },
    {
      timestamp: 1740166543000,
      value: 5000464185.201564,
    },
    {
      timestamp: 1740166603000,
      value: 5001669934.944093,
    },
    {
      timestamp: 1740166663000,
      value: 5001497083.202703,
    },
    {
      timestamp: 1740166723000,
      value: 5001011172.672396,
    },
    {
      timestamp: 1740166783000,
      value: 4992008144.654252,
    },
    {
      timestamp: 1740166843000,
      value: 5001831380.890524,
    },
    {
      timestamp: 1740166903000,
      value: 5001924806.276582,
    },
    {
      timestamp: 1740166963000,
      value: 5000916037.925857,
    },
    {
      timestamp: 1740167023000,
      value: 5002960670.484395,
    },
    {
      timestamp: 1740167083000,
      value: 4996184711.242969,
    },
    {
      timestamp: 1740167143000,
      value: 5000408631.826216,
    },
    {
      timestamp: 1740167203000,
      value: 5001631112.771454,
    },
    {
      timestamp: 1740167263000,
      value: 4998643337.888756,
    },
    {
      timestamp: 1740167323000,
      value: 4997817860.921065,
    },
    {
      timestamp: 1740167383000,
      value: 4996502887.860745,
    },
    {
      timestamp: 1740167443000,
      value: 4999178998.162529,
    },
    {
      timestamp: 1740167503000,
      value: 4994865192.767912,
    },
    {
      timestamp: 1740167563000,
      value: 5005724862.797634,
    },
    {
      timestamp: 1740167623000,
      value: 4999589122.343746,
    },
    {
      timestamp: 1740167683000,
      value: 5007221017.048959,
    },
    {
      timestamp: 1740167743000,
      value: 4996445205.790302,
    },
    {
      timestamp: 1740167803000,
      value: 5000366399.336565,
    },
    {
      timestamp: 1740167863000,
      value: 4999095693.988176,
    },
    {
      timestamp: 1740167923000,
      value: 4996619332.9898,
    },
    {
      timestamp: 1740167983000,
      value: 4993659092.807705,
    },
    {
      timestamp: 1740168043000,
      value: 5009543189.323464,
    },
    {
      timestamp: 1740168103000,
      value: 4994787455.051904,
    },
    {
      timestamp: 1740168163000,
      value: 4993292628.398588,
    },
    {
      timestamp: 1740168223000,
      value: 5009871829.741958,
    },
    {
      timestamp: 1740168283000,
      value: 5002778061.339198,
    },
    {
      timestamp: 1740168343000,
      value: 4999817422.413484,
    },
    {
      timestamp: 1740168403000,
      value: 4994998220.218649,
    },
    {
      timestamp: 1740168463000,
      value: 4997729058.293921,
    },
    {
      timestamp: 1740168523000,
      value: 5004827623.343801,
    },
    {
      timestamp: 1740168583000,
      value: 4995786421.375828,
    },
    {
      timestamp: 1740168643000,
      value: 5002188834.540807,
    },
    {
      timestamp: 1740168703000,
      value: 5000390248.439431,
    },
    {
      timestamp: 1740168763000,
      value: 4994598636.529923,
    },
    {
      timestamp: 1740168823000,
      value: 4993232474.252971,
    },
    {
      timestamp: 1740168883000,
      value: 5015096657.077068,
    },
    {
      timestamp: 1740168943000,
      value: 4995845911.9815035,
    },
    {
      timestamp: 1740169003000,
      value: 5002761273.34156,
    },
    {
      timestamp: 1740169063000,
      value: 4995737637.523023,
    },
    {
      timestamp: 1740169123000,
      value: 4991925780.139541,
    },
    {
      timestamp: 1740169183000,
      value: 5010169320.08084,
    },
    {
      timestamp: 1740169243000,
      value: 4993772659.0981,
    },
    {
      timestamp: 1740169303000,
      value: 5005649892.409724,
    },
    {
      timestamp: 1740169363000,
      value: 5452769628.274348,
    },
    {
      timestamp: 1740169423000,
      value: 4994355347.268937,
    },
    {
      timestamp: 1740169483000,
      value: 5005185973.638839,
    },
    {
      timestamp: 1740169543000,
      value: 5001042443.806114,
    },
    {
      timestamp: 1740169603000,
      value: 4995978113.541379,
    },
    {
      timestamp: 1740169663000,
      value: 4996046489.761501,
    },
    {
      timestamp: 1740169723000,
      value: 5004127086.180883,
    },
    {
      timestamp: 1740169783000,
      value: 4615078611.35084,
    },
  ],
  timeseriesCount: 1,
}

const mockUtilizationChartData1 = [
  {
    timestamp: 1740166183000,
    value: 100.04612223059189,
  },
  {
    timestamp: 1740166243000,
    value: 100.11495941175761,
  },
  {
    timestamp: 1740166303000,
    value: 99.92585787169057,
  },
  {
    timestamp: 1740166363000,
    value: 99.9610193770151,
  },
  {
    timestamp: 1740166423000,
    value: 100.09578288181301,
  },
  {
    timestamp: 1740166483000,
    value: 99.86429620301656,
  },
  {
    timestamp: 1740166543000,
    value: 100.00928370403128,
  },
  {
    timestamp: 1740166603000,
    value: 100.03339869888185,
  },
  {
    timestamp: 1740166663000,
    value: 100.02994166405406,
  },
  {
    timestamp: 1740166723000,
    value: 100.02022345344791,
  },
  {
    timestamp: 1740166783000,
    value: 99.84016289308505,
  },
  {
    timestamp: 1740166843000,
    value: 100.03662761781047,
  },
  {
    timestamp: 1740166903000,
    value: 100.03849612553164,
  },
  {
    timestamp: 1740166963000,
    value: 100.01832075851712,
  },
  {
    timestamp: 1740167023000,
    value: 100.0592134096879,
  },
  {
    timestamp: 1740167083000,
    value: 99.92369422485937,
  },
  {
    timestamp: 1740167143000,
    value: 100.00817263652432,
  },
  {
    timestamp: 1740167203000,
    value: 100.03262225542908,
  },
  {
    timestamp: 1740167263000,
    value: 99.97286675777512,
  },
  {
    timestamp: 1740167323000,
    value: 99.9563572184213,
  },
  {
    timestamp: 1740167383000,
    value: 99.93005775721491,
  },
  {
    timestamp: 1740167443000,
    value: 99.98357996325059,
  },
  {
    timestamp: 1740167503000,
    value: 99.89730385535825,
  },
  {
    timestamp: 1740167563000,
    value: 100.11449725595268,
  },
  {
    timestamp: 1740167623000,
    value: 99.99178244687492,
  },
  {
    timestamp: 1740167683000,
    value: 100.14442034097918,
  },
  {
    timestamp: 1740167743000,
    value: 99.92890411580605,
  },
  {
    timestamp: 1740167803000,
    value: 100.0073279867313,
  },
  {
    timestamp: 1740167863000,
    value: 99.98191387976352,
  },
  {
    timestamp: 1740167923000,
    value: 99.93238665979601,
  },
  {
    timestamp: 1740167983000,
    value: 99.8731818561541,
  },
  {
    timestamp: 1740168043000,
    value: 100.1908637864693,
  },
  {
    timestamp: 1740168103000,
    value: 99.89574910103808,
  },
  {
    timestamp: 1740168163000,
    value: 99.86585256797177,
  },
  {
    timestamp: 1740168223000,
    value: 100.19743659483915,
  },
  {
    timestamp: 1740168283000,
    value: 100.05556122678396,
  },
  {
    timestamp: 1740168343000,
    value: 99.99634844826967,
  },
  {
    timestamp: 1740168403000,
    value: 99.89996440437298,
  },
  {
    timestamp: 1740168463000,
    value: 99.95458116587842,
  },
  {
    timestamp: 1740168523000,
    value: 100.09655246687602,
  },
  {
    timestamp: 1740168583000,
    value: 99.91572842751656,
  },
  {
    timestamp: 1740168643000,
    value: 100.04377669081613,
  },
  {
    timestamp: 1740168703000,
    value: 100.00780496878862,
  },
  {
    timestamp: 1740168763000,
    value: 99.89197273059847,
  },
  {
    timestamp: 1740168823000,
    value: 99.86464948505942,
  },
  {
    timestamp: 1740168883000,
    value: 100.30193314154137,
  },
  {
    timestamp: 1740168943000,
    value: 99.91691823963006,
  },
  {
    timestamp: 1740169003000,
    value: 100.0552254668312,
  },
  {
    timestamp: 1740169063000,
    value: 99.91475275046045,
  },
  {
    timestamp: 1740169123000,
    value: 99.8385156027908,
  },
  {
    timestamp: 1740169183000,
    value: 100.2033864016168,
  },
  {
    timestamp: 1740169243000,
    value: 99.875453181962,
  },
  {
    timestamp: 1740169303000,
    value: 100.11299784819448,
  },
  {
    timestamp: 1740169363000,
    value: 109.05539256548697,
  },
  {
    timestamp: 1740169423000,
    value: 99.88710694537875,
  },
  {
    timestamp: 1740169483000,
    value: 100.10371947277677,
  },
  {
    timestamp: 1740169543000,
    value: 100.02084887612229,
  },
  {
    timestamp: 1740169603000,
    value: 99.91956227082757,
  },
  {
    timestamp: 1740169663000,
    value: 99.92092979523002,
  },
  {
    timestamp: 1740169723000,
    value: 100.08254172361767,
  },
  {
    timestamp: 1740169783000,
    value: 92.30157222701679,
  },
]

test('get utilization chart data and process it for chart display', () => {
  const composedData = composeOxqlData(mockUtilizationQueryResult1)
  expect(composedData).toEqual(mockComposedUtilizationData1)
  const { data: chartData } = getUtilizationChartProps(
    mockComposedUtilizationData1.chartData,
    1
  )
  expect(chartData).toEqual(mockUtilizationChartData1)
})
