import { TextField } from '@oxide/form'
import type { PathParam } from 'app/routes'
import { PARAM_DISPLAY, VALID_PARAMS } from 'app/routes'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import React, { useEffect } from 'react'

interface FormParamFieldsProps {
  id: string
  params: readonly PathParam[]
}

/**
 * Renders a set of inputs to capture route params required by a form if
 * said form isn't being rendered in the context where their available.
 */
export function FormParamFields({
  id,
  params: paramKeys,
}: FormParamFieldsProps) {
  const { initialValues, setFieldValue } =
    useFormikContext<Record<PathParam, string | undefined>>()
  const params = useParams()

  useEffect(() => {
    for (const param of paramKeys) {
      if (!initialValues[param] && params[param]) {
        setFieldValue(param, params[param])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])
  return (
    <>
      {VALID_PARAMS.filter((param) => !(param in params)).map((param) => (
        <FormParam id={`${id}-${param}`} key={`${id}-${param}`} param={param} />
      ))}
    </>
  )
}

interface FormParamProps {
  id: string
  param: PathParam
}
const FormParam = ({ id, param }: FormParamProps) => {
  const { initialValues } =
    useFormikContext<Record<PathParam, string | undefined>>()
  const params = useParams()

  /**
   * If the param is in initialValues and non-empty that means it was
   * explicitly handed down to the Form which implies it shouldn't be
   * configurable to the user. If it's retrieved from the URL it also
   * means it shouldn't be configurable to the user. This may change in
   * the future.
   */
  if (!initialValues[param] && params[param]) return null

  return (
    <TextField id={id} name={param} label={PARAM_DISPLAY[param]} required />
  )
}
