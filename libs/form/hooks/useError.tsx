import { useFormikContext } from 'formik'

export const useError = (name: string): string | undefined => {
  const { errors } = useFormikContext()
  return (errors as Record<string, string>)[name]
}
