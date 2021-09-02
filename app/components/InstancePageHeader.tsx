import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import { instanceCan, useApiQuery, useApiMutation } from '@oxide/api'

import { Icon, PageHeader, PageTitle } from '@oxide/ui'

import { InstanceDetails } from './InstanceDetails'
import { useToast } from '../hooks'

export const InstancePageHeader = () => {
  const navigate = useNavigate()
  const addToast = useToast()
  const { projectName, instanceName } = useParams()

  const {
    data: instance,
    error,
    refetch,
  } = useApiQuery(
    'projectInstancesGetInstance',
    { instanceName, projectName },
    { refetchInterval: 5000 }
  )

  const stopInstance = useApiMutation('projectInstancesInstanceStop', {
    onSuccess: () => {
      refetch()
      addToast({
        icon: 'checkO',
        title: `Instance '${instanceName}' stopped.`,
        timeout: 5000,
      })
    },
  })

  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
    onSuccess: () => {
      addToast({
        icon: 'checkO',
        title: `Instance '${instanceName}' deleted.`,
        timeout: 5000,
      })
      navigate(`/projects/${projectName}`)
    },
  })

  const rebootInstance = useApiMutation('projectInstancesInstanceReboot', {
    onSuccess: () => {
      refetch()
    },
  })

  if (error) {
    if (error.raw.status === 404) {
      return <div>Instance not found</div>
    } else {
      return <div>loading</div>
    }
  }
  if (!instance) return <div>loading</div>

  const handleStop = () => {
    if (instanceCan.stop(instance)) {
      stopInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        variant: 'info',
        icon: 'danger',
        title: 'Only a running instance can be stopped',
        timeout: 5000,
      })
    }
  }

  // TODO: confirm delete modal
  const handleDelete = () => {
    if (instanceCan.delete(instance)) {
      deleteInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        icon: 'checkO',
        title: 'Only a stopped instance can be deleted',
        timeout: 5000,
      })
    }
  }

  const handleReboot = () => {
    if (instanceCan.reboot(instance)) {
      rebootInstance.mutate({
        instanceName: instance.name,
        projectName,
      })
    } else {
      addToast({
        icon: 'checkO',
        title: 'Only a running instance can be rebooted',
        timeout: 5000,
      })
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon="resources">{instance.name}</PageTitle>
        <div className="flex space-x-7 text-gray-300">
          {/* TODO: hook up delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={!instanceCan.delete(instance)}
          >
            <Icon name="trash" />
          </button>
          {/* TODO: fix icon size */}
          <button type="button">
            <Icon name="hourglass" />
          </button>
          {/* TODO: add start action */}
          <Menu>
            <MenuButton>
              <Icon name="more" className="text-sm text-gray-200 mr-4" />
            </MenuButton>
            <MenuList className="TableControls">
              <MenuItem
                onSelect={handleStop}
                disabled={!instanceCan.stop(instance)}
              >
                Stop
              </MenuItem>
              <MenuItem
                onSelect={handleReboot}
                disabled={!instanceCan.reboot(instance)}
              >
                Reboot
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </PageHeader>
      <InstanceDetails instance={instance} className="mt-3" />
    </>
  )
}
