import { useApiQuery } from '@oxide/api'
import {
  Button,
  Close12Icon,
  Divider,
  More12Icon,
  TextField,
  FieldLabel,
  EmptyMessage,
  Key16Icon,
} from '@oxide/ui'
import Dialog from '@reach/dialog'
import { useEffect, useMemo, useState } from 'react'
import type { MouseEventHandler } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Formik } from 'formik'
import { classed } from '@oxide/util'
import cn from 'classnames'

const Footer = classed.div`h-14 flex items-center px-4 border-t border-tertiary text-sans-sm text-secondary`

export function UserSettingsModal() {
  const [showDialog, setShowDialog] = useState(false)
  const close = () => {
    searchParams.delete('settings')
    setShowDialog(false)
    setSearchParams(searchParams, { replace: true })
  }
  const [searchParams, setSearchParams] = useSearchParams()

  const navTo = useMemo(() => {
    return (param: string) => () => {
      searchParams.delete('settings')
      searchParams.set('settings', param)
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const settingsId = searchParams.get('settings')

  useEffect(() => {
    if (typeof settingsId === 'string' && !settingsId) {
      navTo('profile')()
    }
  }, [navTo, settingsId])

  useEffect(() => {
    if (settingsId && !showDialog) {
      setShowDialog(true)
    }
  }, [settingsId, showDialog])

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={close}
      className="h-full max-h-[38rem] w-full max-w-[55rem] rounded-lg bg-transparent p-10"
    >
      <div className="flex h-full border bg-raise border-secondary">
        <div className="flex w-[15rem] flex-shrink-0  flex-col border-r px-4 py-6 border-tertiary">
          <header className="mb-9 flex items-center justify-between">
            <span className="text-sans-lg">User Settings</span>
            <Button
              color="neutral"
              variant="ghost"
              className="!h-6 !w-6 !p-0"
              onClick={close}
            >
              <Close12Icon className="ml-0.5" />
            </Button>
          </header>
          <ul className="w-full space-y-1 text-secondary">
            <SidebarItem
              link="profile"
              label="Profile"
              settingsId={settingsId}
              handleClick={navTo}
            />
            <SidebarItem
              link="appearance"
              label="Appearance"
              settingsId={settingsId}
              handleClick={navTo}
            />
            <SidebarItem
              link="hotkeys"
              label="Hotkeys"
              settingsId={settingsId}
              handleClick={navTo}
            />
            <SidebarItem
              link="ssh-keys"
              label="SSH Keys"
              settingsId={settingsId}
              handleClick={navTo}
            />
            <SidebarItem
              link="access-keys"
              label="Access Keys"
              settingsId={settingsId}
              handleClick={navTo}
            />
            <SidebarItem
              link="rdp-keys"
              label="RDP Keys"
              settingsId={settingsId}
              handleClick={navTo}
            />
          </ul>
        </div>
        <div className="flex flex-1 flex-col">
          {settingsId === 'profile' && <Profile />}
          {settingsId === 'appearance' && <Appearance />}
          {settingsId === 'hotkeys' && <Hotkeys />}
          {settingsId === 'ssh-keys' && <SshKeys />}
          {settingsId === 'access-keys' && <AccessKeys />}
          {settingsId === 'rdp-keys' && <RdpKeys />}
        </div>
      </div>
    </Dialog>
  )
}

export interface SidebarItemProps {
  link: string
  label: string
  settingsId: string | null
  handleClick: (label: string) => MouseEventHandler<HTMLButtonElement> | undefined
}

function SidebarItem(props: SidebarItemProps) {
  const { settingsId, label, handleClick, link } = props
  const active = (isActive: boolean) =>
    isActive ? 'text-accent bg-accent-secondary hover:bg-accent-secondary-hover' : ''

  return (
    <button
      className="block w-full rounded text-left text-sans-sm"
      onClick={handleClick(link)}
    >
      <li className={cn(active(settingsId === link), 'px-2 py-[5px] hover:bg-hover')}>
        {label}
      </li>
    </button>
  )
}

function Profile() {
  return (
    <>
      <Formik initialValues={{}} onSubmit={() => {}}>
        <form className="max-w-[38rem] space-y-6 py-8 px-9">
          <div>
            <FieldLabel id="profile-name-field" htmlFor="profile-name">
              Name
            </FieldLabel>
            <TextField
              id="profile-name"
              name="name"
              required
              disabled={true}
              value="Jane Doe"
            />
          </div>
          <div>
            <FieldLabel id="profile-username-field" htmlFor="profile-username">
              Username
            </FieldLabel>
            <TextField
              id="profile-username"
              name="username"
              required
              disabled={true}
              value="JaneDoe"
            />
          </div>
          <div>
            <FieldLabel id="profile-email-field" htmlFor="profile-email">
              Email
            </FieldLabel>
            <TextField
              id="profile-email"
              name="email"
              required
              disabled={true}
              value="jane@doe.com"
            />
          </div>
          <span className="inline-block text-sans-sm text-secondary">
            Your user information is managed by your organization.{' '}
            <br className="hidden md+:block" />
            To update, contact your{' '}
            <a className="external-link" href="#/">
              IDP admin
            </a>
            .
          </span>
        </form>
      </Formik>
    </>
  )
}

/** TODO: Implement appearance settings */
function Appearance() {
  return <h1>Not yet implemented</h1>
}

/** TODO: Implement hotkey settings */
function Hotkeys() {
  return <h1>Not yet implemented</h1>
}

function SshKeys() {
  const { data } = useApiQuery('sshkeysGet', {})
  const sshKeys = data?.items
  return (
    <>
      {!sshKeys && (
        <div className="flex flex-1 items-center justify-center">
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH Keys"
            body="You need to create a key to be able to see it here"
            buttonText="new ssh key"
            onClick={() => {}}
          />
        </div>
      )}
      {sshKeys && (
        <>
          <div className="flex items-center justify-end py-6 px-9">
            <Button variant="secondary" size="xs">
              New SSH Key
            </Button>
          </div>
          <Divider className="px-0" />
          {sshKeys.map((sshKey) => (
            <>
              <div key={sshKey.id}>
                <header>
                  <span>{sshKey.name}</span>
                  <Button>
                    <More12Icon />
                  </Button>
                </header>
                <span>Added {sshKey.timeCreated}</span>
              </div>
              <Divider className="px-0" />
            </>
          ))}
          <div className="flex-1" />
        </>
      )}
      <Footer>
        <span>
          Learn more about{' '}
          <a className="external-link" href="/#">
            Generating SSH Keys
          </a>
        </span>
      </Footer>
    </>
  )
}

/** TODO: Implement access key settings */
function AccessKeys() {
  return <h1>Not yet implemented</h1>
}

/** TODO: Implement rdp key settings */
function RdpKeys() {
  return <h1>Not yet implemented</h1>
}
