import React from 'react'
import { Link } from 'react-router-dom'
import { useApiQuery, useApiMutation } from '@oxide/api'
import { buttonStyle, Button } from '@oxide/ui'

export function TopBar() {
  const logout = useApiMutation('logout', {
    onSuccess: () => {
      // reload triggers login redirect from the server. see TODO comments
      // on reloadIf401 in api hooks file for possible correctness caveat
      window.location.reload()
    },
  })
  const { data: user, error } = useApiQuery(
    'sessionMe',
    {},
    { cacheTime: 0, refetchOnWindowFocus: false }
  )

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
