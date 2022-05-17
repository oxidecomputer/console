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
  RadioCard,
} from '@oxide/ui'
import Dialog from '@reach/dialog'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { classed } from '@oxide/util'
import cn from 'classnames'
import { formatDistanceToNow } from 'date-fns/esm'
import type { Mutation } from './form'
import { ComboboxField } from './form'
import { RadioField } from './form'

const Footer = classed.div`h-14 flex items-center px-4 border-t border-tertiary text-sans-sm text-secondary`

const manualMutation: Mutation = {
  status: 'idle',
  data: undefined,
  error: null,
}

const useModalNav = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const settings = searchParams.get('settings')
  const navTo = useMemo(() => {
    return (...params: string[]) => {
      searchParams.delete('settings')
      searchParams.set('settings', params.join('~'))
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  return [settings?.split('~'), navTo] as const
}

export function UserSettingsModal() {
  const [showDialog, setShowDialog] = useState(false)
  const [route, navTo] = useModalNav()
  const [searchParams, setSearchParams] = useSearchParams()
  const close = () => {
    searchParams.delete('settings')
    setShowDialog(false)
    setSearchParams(searchParams, { replace: true })
  }
  const view = route?.[0]

  useEffect(() => {
    if (view === '') {
      navTo('profile')
    }
  }, [navTo, view])

  useEffect(() => {
    console.log(view)
    if (view && !showDialog) {
      setShowDialog(true)
    }
  }, [view, showDialog])

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
              activeLink={view}
              handleClick={navTo}
            />
            <SidebarItem
              link="appearance"
              label="Appearance"
              activeLink={view}
              handleClick={navTo}
            />
            <SidebarItem
              link="hotkeys"
              label="Hotkeys"
              activeLink={view}
              handleClick={navTo}
            />
            <SidebarItem
              link="ssh-keys"
              label="SSH Keys"
              activeLink={view}
              handleClick={navTo}
            />
            <SidebarItem
              link="access-keys"
              label="Access Keys"
              activeLink={view}
              handleClick={navTo}
            />
            <SidebarItem
              link="rdp-keys"
              label="RDP Keys"
              activeLink={view}
              handleClick={navTo}
            />
          </ul>
        </div>
        <div className="flex flex-1 flex-col">
          {view === 'profile' && <Profile />}
          {view === 'appearance' && <Appearance />}
          {view === 'hotkeys' && <Hotkeys />}
          {view === 'ssh-keys' && <SshKeys />}
          {view === 'access-keys' && <AccessKeys />}
          {view === 'rdp-keys' && <RdpKeys />}
        </div>
      </div>
    </Dialog>
  )
}

export interface SidebarItemProps {
  link: string
  label: string
  activeLink: string | undefined
  handleClick: (label: string) => void
}

function SidebarItem(props: SidebarItemProps) {
  const { activeLink: settingsId, label, handleClick, link } = props
  const active = (isActive: boolean) =>
    isActive ? 'text-accent bg-accent-secondary hover:bg-accent-secondary-hover' : ''

  return (
    <button
      className="block w-full rounded text-left text-sans-sm"
      onClick={() => handleClick(link)}
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
  return (
    <Formik
      id="appearance-form"
      title="Appearance"
      initialValues={{ theme: 'dark', contrast: '', motion: '' }}
      onSubmit={() => {}}
      mutation={manualMutation}
    >
      <Form className="space-y-4 py-5 px-8">
        <RadioField
          id="theme-select"
          name="theme"
          label="Theme mode"
          className="w-fit flex-nowrap text-sans-md"
        >
          <RadioCard value="dark">
            <div className="flex flex-col space-y-2">
              <svg
                className="max-h-[137px] max-w-[237px]"
                viewBox="0 0 237 137"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="237" height="137" rx="1" fill="#080F11" />
                <line x1="45.5" y1="-2.18557e-08" x2="45.5" y2="138" stroke="#1C2325" />
                <rect x="60" y="16" width="59" height="6" rx="1" fill="#2E8160" />
                <rect x="60" y="37" width="161" height="12" rx="1" fill="#102422" />
                <rect x="108" y="77" width="113" height="12" rx="1" fill="#1C2325" />
                <rect x="108" y="61" width="113" height="12" rx="1" fill="#1C2325" />
                <rect x="108" y="93" width="113" height="12" rx="1" fill="#1C2325" />
              </svg>
              <span>Default (Dark)</span>
            </div>
          </RadioCard>
          <RadioCard value="light">
            <div className="flex flex-col space-y-2">
              <svg
                className="max-h-[137px] max-w-[237px]"
                viewBox="0 0 237 137"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="237" height="137" rx="1" fill="#DBDBDC" />
                <rect x="60" y="16" width="59" height="6" rx="1" fill="#141A1C" />
                <rect
                  opacity="0.6"
                  x="60"
                  y="37"
                  width="161"
                  height="12"
                  rx="1"
                  fill="#48D597"
                />
                <rect x="108" y="77" width="113" height="12" rx="1" fill="#AEB0B2" />
                <rect x="108" y="61" width="113" height="12" rx="1" fill="#AEB0B2" />
                <rect x="108" y="93" width="113" height="12" rx="1" fill="#AEB0B2" />
                <rect x="60" y="61" width="32" height="32" rx="1" fill="#AEB0B2" />
                <line x1="45.5" y1="2.18557e-08" x2="45.5" y2="137" stroke="#AEB0B2" />
              </svg>
              <span>Light</span>
            </div>
          </RadioCard>
        </RadioField>
        <ComboboxField
          id="theme-contrast"
          name="contrast"
          label="Theme contrast"
          items={['Default', 'High Contrast']}
          required
        ></ComboboxField>
        <ComboboxField
          id="reduce-motion"
          name="motion"
          label="Reduce Motion"
          items={['Use system settings', 'Low motion', 'High motion']}
          required
        ></ComboboxField>
      </Form>
    </Formik>
  )
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
              <div key={sshKey.id} className="mx-5 my-3">
                <header className="flex justify-between text-sans-md">
                  <span>{sshKey.name}</span>
                  <Button variant="ghost" color="neutral" className="!border-0" size="xs">
                    <More12Icon className="pl-0.5" />
                  </Button>
                </header>
                <span className="text-sans-sm text-secondary">
                  Added {formatDistanceToNow(sshKey.timeCreated, { addSuffix: true })}
                </span>
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
