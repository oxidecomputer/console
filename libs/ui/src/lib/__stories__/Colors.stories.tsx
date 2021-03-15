import React from 'react'
import { colorPalette } from '@oxide/theme'

export const AllColors = ({ children }) => {
  const colorNames = new Set(
    Object.keys(colorPalette).map((color) => color.replace(/[0-9]/g, ''))
  )

  let renderAllColors = []

  colorNames.forEach((key) => {
    const colorGroup = Object.keys(colorPalette).filter((color) =>
      color.startsWith(key)
    )
    if (children) {
      renderAllColors = [...renderAllColors, children(key, colorGroup)]
    }
  })

  return (
    <div
      style={{
        alignItems: 'flex-start',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      {renderAllColors}
    </div>
  )
}
