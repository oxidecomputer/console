import { VALID_PARAMS } from 'app/routes'
import type { ComponentType } from 'react'

const forms = Object.entries(
  import.meta.glob<{ default: ComponentType; params: string[] }>('../*.tsx')
)

test.each(forms)(
  '%s exports params and a default form component',
  async (_, promisedFormModule) => {
    const { default: form, params } = await promisedFormModule()

    expect(typeof form).toEqual('function')
    expect(Array.isArray(params)).toBe(true)
    params.forEach((param) => expect(VALID_PARAMS).toContain(param))
  }
)

// TODO: Figure out whatever the fuck is happening here
//
// test.each(forms)(
//   `%s renders correctly at /`,
//   async (_, promisedFormModule) => {
//     const { default: Form, params } = await promisedFormModule()

//     const { getByLabelText } = render(<Form />, { wrapper: Wrapper })

//     for (const param of params) {
//       expect(getByLabelText(PARAM_DISPLAY[param])).toBeInTheDocument()
//     }
//   },
//   1000
// )
