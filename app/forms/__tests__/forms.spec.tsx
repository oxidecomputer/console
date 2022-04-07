import { PARAM_DISPLAY, VALID_PARAMS } from 'app/routes'
import { queryClientOptions } from 'app/test/utils'
import type { ComponentType } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import React from 'react'
import { render, cleanup } from '@testing-library/react'

const forms = Object.entries(
  import.meta.glob<{ default: ComponentType; params: string[] }>('../*.tsx')
)

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient(queryClientOptions)
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

test.each(forms)(
  '%s exports params and a default form component',
  async (_, promisedFormModule) => {
    const { default: form, params } = await promisedFormModule()

    expect(typeof form).toEqual('function')
    expect(Array.isArray(params)).toBe(true)
    params.forEach((param) => expect(VALID_PARAMS).toContain(param))
  }
)

test.each(forms)(`%s renders correctly at /`, async (_, promisedFormModule) => {
  const { default: Form, params } = await promisedFormModule()

  const { getByLabelText } = render(<Form />, { wrapper: Wrapper })

  for (const param of params) {
    // @ts-expect-error it's fine, trust me
    expect(getByLabelText(PARAM_DISPLAY[param])).toBeInTheDocument()
  }
  cleanup()
})
