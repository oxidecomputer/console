import { useFormikContext } from 'formik'

export const useFieldError = (name: string): string | undefined => {
  const { errors } = useFormikContext()
  return (errors as Record<string, string>)[name]
}
