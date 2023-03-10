import { Link } from 'react-router-dom'

import { Button, OpenLink12Icon, Wrap } from '@oxide/ui'

type PropsBasics = {
  title: string
  docs?: {
    text: string
    link: string
  }
  children: React.ReactNode
}

interface PropsWithAction extends PropsBasics {
  cta: {
    text?: string
    action?: () => void
    link: never
  }
}

interface PropsWithLink extends PropsBasics {
  cta: {
    text?: string
    action?: never
    link: string
  }
}

type Props = PropsWithAction | PropsWithLink

export const SettingsGroup = ({ title, docs, children, cta }: Props) => {
  return (
    <div className="w-full max-w-[660px] rounded-lg border text-sans-md text-secondary border-default">
      <div className="p-6">
        <div className="mb-1 text-sans-lg text-default">{title}</div>
        {children}
      </div>
      <div className="flex items-center justify-between border-t px-6 py-3 border-default">
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

        <Wrap when={cta.link} with={<Link to={cta.link} />}>
          <Button size="sm" onClick={cta.action ? cta.action : () => {}}>
            {cta.text || 'Save'}
          </Button>
        </Wrap>
      </div>
    </div>
  )
}
