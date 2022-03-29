import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form } from 'formik'

import {
  Button,
  PageHeader,
  PageTitle,
  TextField,
  TextFieldError,
  TextFieldHint,
  Folder24Icon,
  Success16Icon,
  FieldLabel,
} from '@oxide/ui'
import { useApiMutation, useApiQueryClient } from '@oxide/api'
import { useToast } from '../hooks'
import { getServerError } from '../util/errors'
import { validateName } from '../util/validate'

const ERROR_CODES = {
  ObjectAlreadyExists: 'An organization with that name already exists',
}

export default function OrgCreatePage() {
  const queryClient = useApiQueryClient()
  const addToast = useToast()
  const navigate = useNavigate()

  const createOrg = useApiMutation('organizationsPost', {
    onSuccess(org) {
      queryClient.invalidateQueries('organizationsGet', {})
      // avoid the org fetch when the org page loads since we have the data
      queryClient.setQueryData(
        'organizationsGetOrganization',
        { orgName: org.name },
        org
      )
      addToast({
        icon: <Success16Icon />,
        title: 'Success!',
        content: 'Your organization has been created.',
        timeout: 5000,
      })
      navigate(`../${org.name}`)
    },
  })

  return (
    <>
      <Formik
        initialValues={{ name: '', description: '' }}
        onSubmit={({ name, description }) => {
          createOrg.mutate({
            body: { name, description },
          })
        }}
      >
        <Form>
          <div className="mb-4">
            <FieldLabel htmlFor="org-name">Choose a name</FieldLabel>
            <TextField
              id="org-name"
              name="name"
              placeholder="Enter name"
              validate={validateName}
              autoComplete="off"
            />
            <TextFieldError name="name" />
          </div>
          <div className="mb-8">
            <FieldLabel htmlFor="org-description">
              Choose a description
            </FieldLabel>
            <TextFieldHint id="description-hint">
              What is unique about your organization?
            </TextFieldHint>
            <TextField
              id="org-description"
              name="description"
              aria-describedby="description-hint"
              placeholder="An organization"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-[30rem]"
            disabled={createOrg.isLoading}
          >
            Create organization
          </Button>
          <div className="mt-2 text-destructive">
            {getServerError(createOrg.error, ERROR_CODES)}
          </div>
        </Form>
      </Formik>
    </>
  )
}
