import cn from 'classnames'
import { useSearchParams } from 'react-router-dom'

import { Identicon, buttonStyle } from '@oxide/ui'

import 'app/components/login-page.css'

import { useIdpSelector } from '../hooks'

/** SAML "login page" that just links to the actual IdP */
export function LoginPageSaml() {
  const [searchParams] = useSearchParams()
  const { silo, provider } = useIdpSelector()

  const redirect_uri = searchParams.get('redirect_uri')?.trim()
  const query = redirect_uri ? `?redirect_uri=${redirect_uri}` : ''

  return (
    <>
      <div className="mb-3 flex items-end space-x-3">
        <Identicon
          className="flex h-[34px] w-[34px] items-center justify-center rounded text-accent bg-accent-secondary-hover"
          name={silo}
        />
        <div className="text-sans-2xl text-default">{silo}</div>
      </div>

      <hr className="my-6 w-full border-0 border-b border-b-secondary" />

      <a
        className={cn(buttonStyle({}), 'w-full')}
        href={`/login/${silo}/saml/${provider}/redirect${query}`}
      >
        {/* TODO: kebabCaseToWords(provider) */}
        Sign in with {provider}
      </a>
    </>
  )
}
