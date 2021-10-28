import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import { instanceCan, useApiQuery, useApiMutation } from '@oxide/api'
import {
  PageHeader,
  PageTitle,
  DeleteMediumIcon,
  HourglassMediumIcon,
  MoreMiscIcon,
  InstancesLargeIcon,
  SuccessAlertIcon,
  CommentAlertIcon,
} from '@oxide/ui'

import { useParams, useToast } from '../hooks'
import { InstanceDetails } from './InstanceDetails'

export const InstancePageHeader = () => {
  const navigate = useNavigate()
  const addToast = useToast()
  const { projectName, instanceName } = useParams('projectName', 'instanceName')

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
        icon: <SuccessAlertIcon />,
        title: `Instance '${instanceName}' stopped.`,
        timeout: 5000,
      })
    },
  })

  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
    onSuccess: () => {
      addToast({
        icon: <SuccessAlertIcon />,
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
        icon: <CommentAlertIcon />,
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
        variant: 'info',
        icon: <CommentAlertIcon />,
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
        variant: 'info',
        icon: <CommentAlertIcon />,
        title: 'Only a running instance can be rebooted',
        timeout: 5000,
      })
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<InstancesLargeIcon />}>{instance.name}</PageTitle>
        <div className="flex space-x-7 text-gray-300">
          {/* TODO: hook up delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={!instanceCan.delete(instance)}
          >
            <DeleteMediumIcon />
          </button>
          <button type="button">
            <HourglassMediumIcon title="load" />
          </button>
          {/* TODO: add start action */}
          <Menu>
            <MenuButton>
              <MoreMiscIcon className="text-sm text-gray-200 mr-4" />
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
