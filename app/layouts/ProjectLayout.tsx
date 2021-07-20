import React from 'react'
import { Link, Outlet, useParams } from 'react-router-dom'

import { GlobalNav } from '../components/GlobalNav'
import { OperationList } from '../components/OperationList'

export default () => {
  const { projectName } = useParams()
  return (
    <div className="grid h-screen grid-cols-[14rem,auto] grid-rows-[4rem,auto]">
      <div className="p-5 bg-gray-500 text-green-500 flex items-center">
        <Link to="/">
          <span className="mr-4" style={{ fontSize: '.625rem' }}>
            &#9664;
          </span>
          <span className="text-xs font-mono font-light uppercase">Back</span>
        </Link>
      </div>
      <header className="py-4 px-6 self-center">
        <GlobalNav />
      </header>
      <div className="pb-6 pt-1 overflow-auto bg-gray-500">
        <div className="px-5 mb-4">
          <div className="uppercase text-xs font-mono font-light text-green-500">
            Project
          </div>
          <div className="text-sm font-light">{projectName}</div>
        </div>
        <hr className="border-gray-400 mt-8" />
        <OperationList className="mt-6 px-3" />
      </div>
      <main className="overflow-auto py-2 px-6">
        <Outlet />
      </main>
    </div>
  )
}
