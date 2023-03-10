import { Link } from 'react-router-dom'

import { Button, OpenLink12Icon, buttonStyle } from '@oxide/ui'

type Props = {
  title: string
  docs?: {
    text: string
    link: string
  }
  children: React.ReactNode
  /** String action is a link */
  cta: string | (() => void)
  ctaText: string
}

export const SettingsGroup = ({ title, docs, children, cta, ctaText }: Props) => {
  return (
    <div className="w-full max-w-[660px] rounded-lg border text-sans-md text-secondary border-default">
      <div className="p-6">
        <div className="mb-1 text-sans-lg text-default">{title}</div>
        {children}
      </div>
      <div className="flex items-center justify-between border-t px-6 py-3 border-default">
        {/* div always present to keep the button right-aligned */}
        <div className="text-tertiary">
          {docs && (
            <>
              Learn more about{' '}
              <a href={docs.link} className="text-accent-secondary hover:text-accent">
                {docs.text}
                <OpenLink12Icon className="ml-1 align-middle" />
              </a>
            </>
          )}
        </div>

        {typeof cta === 'string' ? (
          <Link to={cta} className={buttonStyle({ size: 'sm' })}>
            {ctaText}
          </Link>
        ) : (
          <Button size="sm" onClick={cta}>
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  )
}
