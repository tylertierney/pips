import { useEffect, useState } from 'react'

const getCellSizeFromWindow = (gridWidth: number, windowWidth: number) => {
  return Math.min(~~((windowWidth - 16) / gridWidth), 60)
}

export const useCellSize = (gridWidth: number) => {
  const [cellSize, setCellSize] = useState<number>(
    getCellSizeFromWindow(gridWidth, window.innerWidth - 16),
  )

  useEffect(() => {
    const cb = (e: Event) => {
      const w = e.target as Window
      const screenWidth = w.innerWidth
      const result = getCellSizeFromWindow(gridWidth, screenWidth - 16)
      setCellSize(result)
    }

    window.addEventListener('resize', cb)

    return () => window.removeEventListener('resize', cb)
  }, [])

  return cellSize
}
