import React from 'react'

export default function NotFound() {
  return (
    <div className="w-full justify-center flex">
      <div className="my-48 w-96 space-y-4">
        <div>
          <h1 className="text-center text-green-500 text-display-2xl !text-6xl">
            Page not found.
            <br />
            🤷 Sorry.
          </h1>
        </div>
      </div>
    </div>
  )
}
