import { useEffect, useState } from 'react'

export const useWindowSize = () => {
  const [size, setSize] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })

  // Handler to call on window resize
  function handleResize() {
    // Set window width/height to state
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  useEffect(() => {
    // Only execute all the code below in client side
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)

      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return size
}
