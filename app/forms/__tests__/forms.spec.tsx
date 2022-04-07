import type { PathParam } from 'app/routes'
import { PARAM_DISPLAY, VALID_PARAMS } from 'app/routes'
import { queryClientOptions } from 'app/test/utils'
import type { ComponentType } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import { useParams } from 'react-router-dom'

vi.mock('react-router-dom', async () => {
  const rr = await vi.importActual('react-router-dom')
  return {
    // @ts-expect-error says it's unknown but we know. Oh, do we know.
    ...rr,
    useParams: vi.fn(),
  }
})

const forms = Object.entries(
  import.meta.glob<{ default: ComponentType; params: string[] }>('../*.tsx')
)

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient(queryClientOptions)
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

beforeEach(vi.restoreAllMocks)

test.each(forms)(
  '%s exports params and a default form component',
  async (_, promisedFormModule) => {
    const { default: form, params } = await promisedFormModule()

    expect(typeof form).toEqual('function')
    expect(Array.isArray(params)).toBe(true)
    params.forEach((param) => expect(VALID_PARAMS).toContain(param))
  }
)

describe.each([
  {},
  { orgName: 'maze-war' },
  { orgName: 'maze-war', projectName: 'mock-project' },
  {
    orgName: 'maze-war',
    projectName: 'mock-project',
    instanceName: 'mock-instance',
  },
  {
    orgName: 'maze-war',
    projectName: 'mock-project',
    vpcName: 'mock-vpc',
  },
])('Form with route params %o', (routeParams) => {
  afterEach(cleanup)
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue(routeParams)
  })

  test.each(forms)(
    `%s renders inputs for missing route params`,
    async (_, promisedFormModule) => {
      const { default: Form, params } = await promisedFormModule()

      const { getByLabelText, queryByLabelText } = render(<Form />, {
        wrapper: Wrapper,
      })

      for (const param of params.filter((param) => !(param in routeParams))) {
        expect(
          getByLabelText(PARAM_DISPLAY[param as PathParam])
        ).toBeInTheDocument()
      }
      for (const param of params.filter((param) => param in routeParams)) {
        expect(queryByLabelText(PARAM_DISPLAY[param as PathParam])).toBeNull()
      }
    }
  )
})
