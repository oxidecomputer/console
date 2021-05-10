import { formatDistanceToNowStrict } from 'date-fns'

// locale setup and formatDistance function copied from here and modified
// https://github.com/date-fns/date-fns/blob/56a3856/src/locale/en-US/_lib/formatDistance/index.js

const formatDistanceLocale = {
  lessThanXSeconds: '< {{count}}s',
  xSeconds: '{{count}}s',
  halfAMinute: '30s',
  lessThanXMinutes: '< {{count}}m',
  xMinutes: '{{count}}m',
  aboutXHours: '~ {{count}}h',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
  aboutXWeeks: '~ {{count}}w',
  xWeeks: '{{count}}w',
  aboutXMonths: '~ {{count}}mo',
  xMonths: '{{count}}mo',
  aboutXYears: '~ {{count}}y',
  xYears: '{{count}}y',
  overXYears: '> {{count}}y',
  almostXYears: '~ {{count}}y',
}

interface Options {
  addSuffix: boolean
}

function formatDistance(
  token: keyof typeof formatDistanceLocale,
  count: string,
  options: Options
) {
  const result = formatDistanceLocale[token]?.replace('{{count}}', count)
  if (result && options.addSuffix) {
    return result + ' ago'
  }
  return result
}

export const timeAgoAbbr = (d: Date, options: Options = { addSuffix: false }) =>
  formatDistanceToNowStrict(d, { ...options, locale: { formatDistance } })
