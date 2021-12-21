import type { User } from '@oxide/api'
import { useApiQuery } from '@oxide/api'
import React from 'react'

const UserContext = React.createContext<User | null>(null)

export function UserProvider(props: { children: React.ReactNode }) {
  const { data, error } = useApiQuery('sessionMe', {})
  console.log(data, error)
  return (
    <UserContext.Provider value={data || null}>
      {props.children}
    </UserContext.Provider>
  )
}

export const useUser = () => React.useContext(UserContext)
