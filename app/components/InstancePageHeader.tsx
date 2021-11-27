import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'

import { instanceCan, useApiQuery, useApiMutation } from '@oxide/api'
import {
  PageHeader,
  PageTitle,
  Delete16Icon,
  Hourglass16Icon,
  MoreMiscIcon,
  Instances24Icon,
  Success16Icon,
  Comment16Icon,
} from '@oxide/ui'

import { useParams, useToast } from '../hooks'
import { InstanceDetails } from './InstanceDetails'

export const InstancePageHeader = () => {
  const navigate = useNavigate()
  const addToast = useToast()
  const { orgName, projectName, instanceName } = useParams(
    'orgName',
    'projectName',
    'instanceName'
  )

  const {
    data: instance,
    error,
    refetch,
  } = useApiQuery(
    'projectInstancesGetInstance',
    { organizationName: orgName, projectName, instanceName },
    { refetchInterval: 5000 }
  )

  const stopInstance = useApiMutation('projectInstancesInstanceStop', {
    onSuccess: () => {
      refetch()
      addToast({
        icon: <Success16Icon />,
        title: `Instance '${instanceName}' stopped.`,
        timeout: 5000,
      })
    },
  })

  const deleteInstance = useApiMutation('projectInstancesDeleteInstance', {
    onSuccess: () => {
      addToast({
        icon: <Success16Icon />,
        title: `Instance '${instanceName}' deleted.`,
        timeout: 5000,
      })
      navigate(`/orgs/${orgName}/projects/${projectName}`)
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
      return null
    }
  }
  if (!instance) return null

  const handleStop = () => {
    if (instanceCan.stop(instance)) {
      stopInstance.mutate({
        organizationName: orgName,
        projectName,
        instanceName: instance.name,
      })
    } else {
      addToast({
        variant: 'info',
        icon: <Comment16Icon />,
        title: 'Only a running instance can be stopped',
        timeout: 5000,
      })
    }
  }

  // TODO: confirm delete modal
  const handleDelete = () => {
    if (instanceCan.delete(instance)) {
      deleteInstance.mutate({
        organizationName: orgName,
        projectName,
        instanceName: instance.name,
      })
    } else {
      addToast({
        variant: 'info',
        icon: <Comment16Icon />,
        title: 'Only a stopped instance can be deleted',
        timeout: 5000,
      })
    }
  }

  const handleReboot = () => {
    if (instanceCan.reboot(instance)) {
      rebootInstance.mutate({
        organizationName: orgName,
        projectName,
        instanceName: instance.name,
      })
    } else {
      addToast({
        variant: 'info',
        icon: <Comment16Icon />,
        title: 'Only a running instance can be rebooted',
        timeout: 5000,
      })
    }
  }

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Instances24Icon />}>{instance.name}</PageTitle>
        <div className="flex space-x-7 text-gray-300">
          {/* TODO: hook up delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={!instanceCan.delete(instance)}
          >
            <Delete16Icon />
          </button>
          <button type="button">
            <Hourglass16Icon title="load" />
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
