import type { CSSProperties, ReactNode } from 'react'
import {
  BottomLeftCorner,
  BottomRightCorner,
  TopLeftCorner,
  TopRightCorner,
} from '../components/CornerSvg/CornerSvg'
import type { Game, Region } from '../models/models'
import { useCellSize } from './useCellSize'

export const useGridBuilder = (game: Game) => {
  const { regions } = game

  const height =
    Math.max(...regions.flatMap(({ indices }) => indices.map(([row]) => row))) +
    1
  const width =
    Math.max(
      ...regions.flatMap(({ indices }) => indices.map(([_, col]) => col)),
    ) + 1

  const cellSize = useCellSize(width)

  const backgroundCells = new Set<string>(
    regions.flatMap(({ indices }) => indices.map((coords) => String(coords))),
  )

  const cells: Array<
    {
      r: number
      c: number
      isBackgroundCell: boolean
      cornerSvgs: Array<ReactNode>
    } & CSSProperties
  > = Array.from({ length: height })
    .map((_, r) => {
      return Array.from({ length: width }).map((_, c) => {
        return {
          r: r,
          c: c,
          isBackgroundCell: backgroundCells.has(String([r, c])),
          cornerSvgs: [],
        }
      })
    })
    .flat()

  cells.forEach((cell) => {
    const { r, c, isBackgroundCell } = cell
    const backgroundCellNeighbors = {
      top: backgroundCells.has(String([r - 1, c])),
      right: backgroundCells.has(String([r, c + 1])),
      bottom: backgroundCells.has(String([r + 1, c])),
      left: backgroundCells.has(String([r, c - 1])),
    }
    const { top, right, bottom, left } = backgroundCellNeighbors

    if (isBackgroundCell) {
      if (!top && !right) cell.borderTopRightRadius = '0.5em'
      if (!top && !left) cell.borderTopLeftRadius = '0.5em'
      if (!bottom && !right) cell.borderBottomRightRadius = '0.5em'
      if (!bottom && !left) cell.borderBottomLeftRadius = '0.5em'
    } else {
      if (top && right)
        cell.cornerSvgs.push(
          <TopRightCorner key='top-right' className='absolute w-full h-full' />,
        )
      if (top && left)
        cell.cornerSvgs.push(
          <TopLeftCorner key='top-left' className='absolute w-full h-full' />,
        )
      if (bottom && right)
        cell.cornerSvgs.push(
          <BottomRightCorner
            key='bottom-right'
            className='absolute w-full h-full'
          />,
        )
      if (bottom && left)
        cell.cornerSvgs.push(
          <BottomLeftCorner
            key='bottom-left'
            className='absolute w-full h-full'
          />,
        )
    }
  })

  return { height, width, cellSize, cells }
}
