import React from 'react'

export default function NotFound() {
  return (
    <div className="flex w-full justify-center">
      <div className="my-48 w-96 space-y-4">
        <div>
          <h1 className="text-center text-green-500 text-sans-2xl">
            Page not found.
            <br />
            🤷 Sorry.
          </h1>
        </div>
      </div>
    </div>
  )
}
