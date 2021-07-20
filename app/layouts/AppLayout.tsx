import React from 'react'
import { Link, Outlet } from 'react-router-dom'

import { GlobalNav } from '../components/GlobalNav'
import { ProjectList } from '../components/ProjectList'
import Wordmark from '../assets/wordmark.svg'

export default () => (
  <div className="grid h-screen grid-cols-[14rem,auto] grid-rows-[4.5rem,auto]">
    <div className="flex items-center pl-4 bg-gray-500 leading-none">
      <Link to="/">
        <Wordmark />
      </Link>
    </div>
    <header className="py-4 px-6 self-center">
      <GlobalNav />
    </header>
    <div className="pb-6 overflow-auto bg-gray-500">
      <ProjectList className="mt-4 px-3" />
    </div>
    <main className="overflow-auto py-2 px-6">
      <Outlet />
    </main>
  </div>
)
