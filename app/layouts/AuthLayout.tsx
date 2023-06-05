import { Outlet } from 'react-router-dom'

import { OxideLogo } from 'app/components/OxideLogo'

const AuthLayout = () => {
  return (
    <main
      className="relative h-screen"
      style={{
        background:
          'radial-gradient(200% 100% at 50% 100%, var(--surface-default) 0%, #161B1D 100%)',
      }}
    >
      <OxideLogo className="absolute bottom-8 left-1/2 -translate-x-1/2" />
      <div className="z-10 flex h-full items-center justify-center">
        <Outlet />
      </div>
    </main>
  )
}

export default AuthLayout
