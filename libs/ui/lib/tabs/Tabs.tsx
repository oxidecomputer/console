import React from 'react'

// the tabs component is just @reach/tabs plus custom CSS
import './Tabs.css'

// Add the pretty line filling out the rest of the space next to the tabs.
// Unfortunately the line needs to be outside TabList because "TabList should
// only render Tabs". This is the most straightforward way to add a line in a
// way that's reusable and doesn't mess up the calling code. props could be
// normal ReactNode but for now let's require that there's exactly one child.
// This is only meant to wrap TabList.
export const TabListLine = (props: { children: React.ReactElement }) => (
  <div className="flex">
    {props.children}
    <div className="border-b border-gray-400 flex-1 ml-2.5 mb-3" />
  </div>
)
