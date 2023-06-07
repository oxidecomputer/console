import type { FieldValues, Path, UseFormSetValue } from 'react-hook-form'

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
  values: TFieldValues
) {
  Object.keys(values).forEach((key) => {
    if (values[key]) {
      setValue(key as Path<TFieldValues>, values[key])
    }
  })
}

export function clearPersistedFormValues(key: string) {
  sessionStorage.removeItem(key)
}
