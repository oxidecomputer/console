import React, { useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Dialog } from '@reach/dialog'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'

import { useApiQuery } from '@oxide/api'
import './quick-menu.css'
import { useKey } from '../hooks'

// TODO: things reach combobox doesn't seem to let me do
// (see cmd+k menu on tailwindcss.com for example)
// - start with popover open
// - auto-highlight first option (https://github.com/reach/reach-ui/issues/766)

// TODO: shouldn't show a given link when you're already on that page. values
// will have to have more structure, like some kind of showWhen function
const globalPaths: Record<string, string> = {
  'Create project': '/projects/new',
}

const projectPaths: Record<string, (s: string) => string> = {
  'Create instance': (projectName) => `/projects/${projectName}/instances/new`,
  'Project instances': (projectName) => `/projects/${projectName}/instances`,
}

function useProjectName(): string | null {
  const match = useRouteMatch<{ projectName: string }>('/projects/:projectName')
  return match && match.params.projectName !== 'new'
    ? match.params.projectName
    : null
}

// not in use yet but this is how it will work
// eslint-disable-next-line
function useInstanceName(): string | null {
  const match = useRouteMatch<{
    projectName: string
    instanceName: string
  }>('/projects/:projectName/instances/:instanceName')
  return match && match.params.instanceName !== 'new'
    ? match.params.instanceName
    : null
}

export default () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  useKey(['ctrl+k', 'command+k'], (e) => {
    e.preventDefault()
    setIsOpen(true)
  })

  const reset = () => {
    setIsOpen(false)
    setInput('')
  }

  const { data: projects } = useApiQuery('apiProjectsGet', {})
  const projectNames = projects?.items.map((p) => p.name) || []
  let values = [...projectNames, ...Object.keys(globalPaths)]

  // if in context of a particular project, include project-specific paths
  const projectName = useProjectName()
  if (projectName) {
    // TODO: add list of instances
    values = [...Object.keys(projectPaths), ...values]
  }

  const history = useHistory()
  const goToProject = (value: string) => {
    let path = ''
    if (projectName && value in projectPaths) {
      path = projectPaths[value](projectName)
    } else {
      path = globalPaths[value] || `/projects/${value}`
    }
    history.push(path)
    reset()
  }

  return (
    <Dialog
      className="QuickMenu !bg-gray-500 !p-4 !w-1/3 !mt-[20vh] border border-gray-400 rounded-px"
      isOpen={isOpen}
      onDismiss={reset}
      aria-label="Quick actions"
    >
      <Combobox aria-label="Quick actions" onSelect={goToProject}>
        <ComboboxInput
          className="mousetrap !bg-gray-500 border-none focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <hr className="my-4" />
        <ComboboxPopover
          portal={false}
          className="!bg-transparent !border-none"
        >
          <ComboboxList className="space-y-2">
            {values
              .filter((v) => new RegExp(input, 'gi').test(v))
              .map((v) => (
                <ComboboxOption
                  className="bg-gray-500 hover:!border-green-500 hover:!bg-gray-500 rounded-px !p-4 text-display-lg border border-gray-400"
                  key={v}
                  value={v}
                />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </Dialog>
  )
}
