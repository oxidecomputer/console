import { Link } from 'react-router-dom'
import { navToLogin, useApiQuery, useApiMutation } from '@oxide/api'
import { buttonStyle, Button } from '@oxide/ui'

export function TopBar() {
  const logout = useApiMutation('logout', {
    onSuccess: () => {
      // server will respond to /login with a login redirect
      // TODO-usability: do we just want to dump them back to login or is there
      // another page that would make sense, like a logged out homepage
      navToLogin({ includeCurrent: false })
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
    <div className="flex h-10 justify-end">
      <div>{contents}</div>
    </div>
  )
}
