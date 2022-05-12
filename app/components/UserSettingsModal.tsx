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
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Formik } from 'formik'
import { classed } from '@oxide/util'

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
  if (typeof settingsId === 'string' && !settingsId) {
    navTo('profile')()
  }

  if (settingsId && !showDialog) {
    setShowDialog(true)
  }

  const active = (isActive: boolean) => (isActive ? 'text-accent bg-accent-secondary' : '')

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={close}
      className="min-w-[35rem] rounded-lg border p-0 bg-raise border-secondary"
    >
      <div className="flex">
        <div className="flex w-56 flex-shrink-0  flex-col border-r px-4 py-6 border-tertiary">
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
          <ul className="w-40 space-y-1 text-sans-sm text-secondary children:rounded children:px-2 children:py-1">
            <li className={active(settingsId === 'profile')}>
              <button onClick={navTo('profile')}>Profile</button>
            </li>
            <li className={active(settingsId === 'appearance')}>
              <button onClick={navTo('appearance')}>Appearance</button>
            </li>
            <li className={active(settingsId === 'hotkeys')}>
              <button onClick={navTo('hotkeys')}>Hotkeys</button>
            </li>
            <li className={active(settingsId === 'ssh-keys')}>
              <button onClick={navTo('ssh-keys')}>SSH Keys</button>
            </li>
            <li className={active(settingsId === 'access-keys')}>
              <button onClick={navTo('access-keys')}>Access Keys</button>
            </li>
            <li className={active(settingsId === 'rdp-keys')}>
              <button onClick={navTo('rdp-keys')}>RDP Keys</button>
            </li>
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

function Profile() {
  return (
    <>
      <Formik initialValues={{}}>
        <form className="max-w-md space-y-3 py-8 px-9">
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
            Your user information is managed by your organization. To update, contact your{' '}
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
