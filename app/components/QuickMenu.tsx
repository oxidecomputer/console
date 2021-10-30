import React, { useState } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
import { Dialog } from '@reach/dialog'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox'
import { matchSorter } from 'match-sorter'

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
  'Project access': (projectName) => `/projects/${projectName}/access`,
}

// can't use useParams because QuickMenu is not rendered inside the route tree, so
// it does not have access to the current route
function useProjectName(): string | null {
  const match = useMatch('/projects/:projectName')
  return match?.params.projectName && match.params.projectName !== 'new'
    ? match.params.projectName
    : null
}

// not in use yet but this is how it will work
// eslint-disable-next-line
function useInstanceName(): string | null {
  const match = useMatch('/projects/:projectName/instances/:instanceName')
  return match?.params.instanceName && match.params.instanceName !== 'new'
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

  const { data: projects } = useApiQuery('organizationProjectsGet', {
    organizationName: 'maze-war',
  })
  const projectNames = projects?.items.map((p) => p.name) || []
  let values: string[] = [...projectNames, ...Object.keys(globalPaths)]

  // if in context of a particular project, include project-specific paths
  const projectName = useProjectName()
  if (projectName) {
    // TODO: add list of instances
    values = [...Object.keys(projectPaths), ...values]
  }

  const navigate = useNavigate()
  const goToProject = (value: string) => {
    let path = ''
    if (projectName && value in projectPaths) {
      path = projectPaths[value](projectName)
    } else {
      path = globalPaths[value] || `/projects/${value}`
    }
    navigate(path)
    reset()
  }

  const matches = matchSorter(values, input)
  const showResults = input.trim().length > 0 && matches.length > 0

  return (
    <Dialog
      className="QuickMenu !bg-gray-500 !p-4 !w-1/3 !mt-[20vh] border border-gray-400 rounded"
      isOpen={isOpen}
      onDismiss={reset}
      aria-label="Quick actions"
    >
      <Combobox aria-label="Quick actions" onSelect={goToProject}>
        <ComboboxInput
          autocomplete={false}
          className="mousetrap !bg-gray-500 border-none focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Find anything..."
        />
        {showResults && (
          <>
            <hr className="my-4 border-gray-300" />
            <ComboboxPopover
              portal={false}
              className="!bg-transparent !border-none"
            >
              <ComboboxList className="space-y-2">
                {matches.map((v) => (
                  <ComboboxOption
                    className="bg-gray-500 hover:!border-green-500 hover:!bg-gray-500 rounded !p-4 text-display-lg border border-gray-400"
                    key={v}
                    value={v}
                  />
                ))}
              </ComboboxList>
            </ComboboxPopover>
          </>
        )}
      </Combobox>
    </Dialog>
  )
}
