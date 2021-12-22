import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApiQuery, useApiMutation, useApiQueryClient } from '@oxide/api'
import { buttonStyle, Button } from '@oxide/ui'

export function TopBar() {
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()
  const logout = useApiMutation('logout', {
    onSuccess: () => {
      queryClient.invalidateQueries('sessionMe', {})
      navigate('/login')
    },
  })
  const { data: user, error } = useApiQuery('sessionMe', {})

  let contents = (
    <Link to="/login" className={buttonStyle({ variant: 'link' })}>
      Log in
    </Link>
  )

  if (user || !error) {
    contents = (
      <Button variant="link" onClick={() => logout.mutate({})}>
        Log out
      </Button>
    )
  }

  return (
    <div className="flex justify-end h-10">
      <div>{contents}</div>
    </div>
  )
}
