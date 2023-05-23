import { differenceInSeconds } from 'date-fns'
import type { FieldValues, Path, SetFieldValue } from 'react-hook-form'

export function saveFormValues(key: string, values: FieldValues) {
  const obj = {
    values,
    timestamp: Date.now(),
  }
  sessionStorage.setItem(key, JSON.stringify(obj))
}

export type FormData = {
  values: FieldValues
  timestamp: Date
}

export function getPersistedFormValues(key: string) {
  const data = sessionStorage.getItem(key)
  let parsedData: FormData | null = null
  if (data) {
    try {
      parsedData = JSON.parse(data)
    } catch (err) {
      console.log(err)
    }

    // Return persisted values if they are more recent than 5 minutes
    if (parsedData && differenceInSeconds(Date.now(), parsedData.timestamp) < 300) {
      return parsedData.values
    } else {
      // Clear if not recent
      sessionStorage.removeItem(key)
      return null
    }
  }
  return null
}

export function setPersistedFormValues(
  setValue: SetFieldValue<FieldValues>,
  values: FieldValues,
  prefix?: string
) {
  Object.keys(values).forEach((key) => {
    const value = values[key]

    if (typeof value === 'object') {
      setPersistedFormValues(setValue, value, key)
    }

    // Use prefix to set nested values
    // e.g. diskSource.blockSize
    setValue(`${prefix ? prefix + '.' : ''}${key}` as Path<FieldValues>, values[key])
  })
}

export function clearPersistedFormValues(key: string) {
  sessionStorage.removeItem(key)
}
