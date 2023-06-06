import type { FieldValues, Path, UseFormSetValue, UseFormTrigger } from 'react-hook-form'

export function saveFormValues(key: string, values: FieldValues) {
  sessionStorage.setItem(key, JSON.stringify(values))
}

export function getPersistedFormValues(key: string) {
  const data = sessionStorage.getItem(key)
  if (!data) return null

  let parsedData: FieldValues | null = null
  try {
    parsedData = JSON.parse(data)
  } catch (err) {
    console.log(err)
  }

  if (!parsedData) {
    sessionStorage.removeItem(key)
    return null
  }

  return parsedData
}

export function setPersistedFormValues<TFieldValues extends FieldValues>(
  setValue: UseFormSetValue<TFieldValues>,
  trigger: UseFormTrigger<TFieldValues>,
  values: TFieldValues,
  prefix?: string
) {
  Object.keys(values).forEach((key) => {
    const value = values[key]

    if (typeof value === 'object' && !Array.isArray(value)) {
      setPersistedFormValues(setValue, trigger, value, key)
      return
    }

    // Use prefix to set nested values, e.g. diskSource.blockSize
    const prefixedKey = `${prefix ? prefix + '.' : ''}${key}` as Path<TFieldValues>
    if (values[key]) {
      setValue(prefixedKey, values[key])
      trigger(prefixedKey)
    }
  })
}

export function clearPersistedFormValues(key: string) {
  sessionStorage.removeItem(key)
}
