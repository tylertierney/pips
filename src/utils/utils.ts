import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'
import type { UiDomino } from '../components/GameHome/Game/Game'
import {
  LOCAL_STORAGE_PREFIX,
  type Coords,
  type Difficulty,
  type IDomino,
  type IGame,
  type Region,
  type Today,
} from '../models/models'

export const getGridDimensions = ({
  regions,
}: IGame): { width: number; height: number } => {
  const height =
    Math.max(...regions.flatMap(({ indices }) => indices.map(([row]) => row))) +
    1
  const width =
    Math.max(
      ...regions.flatMap(({ indices }) => indices.map(([_, col]) => col)),
    ) + 1
  return { width, height }
}

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const normalizeRotation = (rotation: number | undefined): number => {
  if (rotation === undefined) return 0
  return (((rotation ?? 0) % 360) + 360) % 360
}

export const getTranslateFromRotation = (
  rotation: number | undefined,
): CSSProperties['translate'] => {
  const normalized = normalizeRotation(rotation)

  switch (normalized) {
    case 90:
      return '50% 0'
    case 180:
      return '100% 100%'
    case 270:
      return '0 200%'
    default:
      return '0'
  }
}

export const isVertical = (rotation: number): boolean => {
  if (!rotation || rotation % 360 === 0 || rotation % 180 === 0) return false
  return true
}

export const clickedDomino = (e: MouseEvent): number | undefined => {
  const elementStack = document.elementsFromPoint(e.clientX, e.clientY)

  const id = elementStack.find((el) => el.id.includes('domino'))?.id
  if (!id) return undefined
  const dominoId = id.replace('domino-', '')

  return parseInt(dominoId, 10)
}

export const traverseStackToFindCell = (
  x: number,
  y: number,
): Coords | null => {
  const elementStack = document.elementsFromPoint(x, y) as HTMLElement[]

  let foundCell = null
  for (const el of elementStack) {
    if (el.dataset['coords']) {
      foundCell = JSON.parse(el.dataset['coords']) as Coords
      break
    }
  }

  return foundCell
}

export const convertGameDominoesToUiDominoes = (
  dominoes: IDomino[],
): UiDomino[] => {
  return dominoes.map((d, idx) => ({ id: idx, domino: d, rotation: 0 }))
}

export const isValidPlacement = ({
  targetR,
  targetC,
  dominoId,
  rotation,
  game,
  dominoes,
}: {
  targetR: number
  targetC: number
  dominoId: number
  rotation: number
  game: IGame
  dominoes: UiDomino[]
}): boolean => {
  const { height, width } = getGridDimensions(game)

  const vertical = isVertical(rotation)
  const [targetR2, targetC2] = vertical
    ? [targetR + 1, targetC]
    : [targetR, targetC + 1]

  return (
    isPlacedInBounds({
      targetR,
      targetC,
      targetR2,
      targetC2,
      height,
      width,
      game,
    }) &&
    isNotColldingWithOtherDominoes({
      targetR,
      targetC,
      targetR2,
      targetC2,
      dominoes,
      dominoId,
    })
  )
}

export const isPlacedInBounds = ({
  targetR,
  targetC,
  targetR2,
  targetC2,

  height,
  width,
  game,
}: {
  targetR: number
  targetC: number
  targetR2: number
  targetC2: number
  height: number
  width: number
  game: IGame
}) => {
  const firstSquareOutOfBounds =
    targetR < 0 || targetR >= height || targetC < 0 || targetC >= width

  const secondSquareOutOfBounds =
    targetR2 < 0 || targetR2 >= height || targetC2 < 0 || targetC2 >= width

  if (firstSquareOutOfBounds || secondSquareOutOfBounds) return false

  const emptyAndRegionCells = new Set(
    game.regions.flatMap((r) => r.indices.map((coords) => String(coords))),
  )

  const blankCells = new Set(
    Array.from({ length: height })
      .map((_, r) =>
        Array.from({ length: width }).map((_, c) => String([r, c])),
      )
      .flat()
      .filter((str) => !emptyAndRegionCells.has(str)),
  )

  if (
    blankCells.has(String([targetR, targetC])) ||
    blankCells.has(String([targetR2, targetC2]))
  )
    return false

  return true
}

export const isNotColldingWithOtherDominoes = ({
  targetR,
  targetC,
  targetR2,
  targetC2,
  dominoes,
  dominoId,
}: {
  targetR: number
  targetC: number
  targetR2: number
  targetC2: number
  dominoes: UiDomino[]
  dominoId: number
}) => {
  const allDominoesExceptThisOne = dominoes.filter((d) => d.id !== dominoId)

  for (const { r, c, rotation } of allDominoesExceptThisOne) {
    if (r === undefined || c === undefined) continue

    const existingDominoCoords: [Coords, Coords] = [
      [r, c],
      isVertical(rotation) ? [r + 1, c] : [r, c + 1],
    ]

    for (const [existingR, existingC] of existingDominoCoords) {
      if (
        (targetR === existingR && targetC === existingC) ||
        (targetR2 === existingR && targetC2 === existingC)
      )
        return false
    }
  }

  return true
}

export const deriveIndicesFromRotatedDomino = (
  uiDomino: UiDomino,
): [Coords, Coords] | null => {
  const { r, c, rotation: _rotation } = uiDomino
  const rotation = normalizeRotation(_rotation)

  if (r === undefined || c === undefined) return null

  if (rotation === 360 || rotation === 0) {
    return [
      [r, c],
      [r, c + 1],
    ]
  }

  if (rotation === 90) {
    return [
      [r, c],
      [r + 1, c],
    ]
  }

  if (rotation === 180) {
    return [
      [r, c + 1],
      [r, c],
    ]
  }

  if (rotation === 270) {
    return [
      [r + 1, c],
      [r, c],
    ]
  }

  return null
}

export const deriveGridStateFromPlacedDominoes = (
  game: IGame,
  dominoes: UiDomino[],
) => {
  const { width, height } = getGridDimensions(game)

  const grid: Array<Array<number | null | undefined>> = Array.from({
    length: height,
  }).map(() => Array.from({ length: width }, () => null))

  for (const uiDomino of dominoes) {
    if (uiDomino.r === undefined || uiDomino.c === undefined) continue
    const res = deriveIndicesFromRotatedDomino(uiDomino)
    if (!res) continue
    const [coords1, coords2] = res
    grid[coords1[0]][coords1[1]] = uiDomino.domino[0]
    grid[coords2[0]][coords2[1]] = uiDomino.domino[1]
  }

  const validGridSpaces = new Set(
    game.regions
      .map(({ indices }) => indices)
      .flat()
      .map((coords) => String(coords)),
  )

  grid.forEach((_, r) => {
    _.forEach((_, c) => {
      if (!validGridSpaces.has(String([r, c]))) {
        grid[r][c] = undefined
      }
    })
  })

  return grid
}

export const getInvalidRegions = (
  game: IGame,
  dominoes: UiDomino[],
): number[] => {
  const res: number[] = []

  const _grid = deriveGridStateFromPlacedDominoes(game, dominoes)

  // if (_grid.flat().filter((v) => v === null).length) return allInvalidRegions

  const grid = _grid as number[][]

  game.regions.forEach((region, idx) => {
    const values = region.indices.map(([r, c]) => grid[r][c])

    if (!isRegionSatisfied(region, values)) {
      res.push(idx)
    }
  })

  return res
}

export const isSolved = (game: IGame, dominoes: UiDomino[]): boolean => {
  if (
    dominoes.filter(({ r, c }) => r === undefined || c === undefined).length
  ) {
    return false
  }

  const _grid = deriveGridStateFromPlacedDominoes(game, dominoes)
  if (_grid.flat().filter((v) => v === null).length) return false
  // const { width, height } = getGridDimensions(game)

  // if (
  //   dominoes.filter(({ r, c }) => r === undefined || c === undefined).length
  // ) {
  //   return false
  // }

  // const _grid = deriveGridStateFromPlacedDominoes(game, width, height, dominoes)

  // if (_grid.flat().filter((v) => v === null).length) return false

  // const grid = _grid as number[][]

  // for (const region of game.regions) {
  //   const values = region.indices.map(([r, c]) => grid[r][c])
  //   if (!isRegionSatisfied(region, values)) return false
  // }

  // return true
  const invalidRegions = getInvalidRegions(game, dominoes)
  return invalidRegions.length === 0
}

export const isRegionSatisfied = (region: Region, values: number[]) => {
  if (values.length !== region.indices.length) return false
  if (values.filter((v) => v === null || v === undefined).length) return false

  const sum = values.reduce((acc, curr) => acc + curr, 0)
  const uniqueValues = new Set(values)

  if (region.type === 'equals') {
    if (uniqueValues.size > 1) return false
  }

  if (region.type === 'greater') {
    if (sum <= (region.target as number)) return false
  }

  if (region.type === 'less') {
    if (sum >= (region.target as number)) return false
  }

  if (region.type === 'sum') {
    if (sum !== (region.target as number)) return false
  }

  if (region.type === 'unequal') {
    if (uniqueValues.size < values.length) return false
  }

  return true
}

export const constructDateFromString = (str: string): Date => {
  const [year, month, day] = str.split('-').map(Number)
  const correctDate = new Date(year, month - 1, day)
  return correctDate
}

export const getStarCount = (today: Today): number => {
  const fromLocalStorage = localStorage.getItem(
    LOCAL_STORAGE_PREFIX + today.printDate,
  )

  let result = 0
  if (fromLocalStorage) {
    const parsed = JSON.parse(fromLocalStorage)
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
    for (const difficulty of difficulties) {
      if (!parsed[difficulty]) continue
      if (isSolved(today[difficulty], parsed[difficulty]?.dominoes)) {
        result++
      }
    }
  }
  return result
}

export const deriveRotatedDominoFromIndices = (
  indices: [Coords, Coords],
): { r: number; c: number; rotation: UiDomino['rotation'] } | null => {
  const [[r1, c1], [r2, c2]] = indices

  if (r1 === r2 && c2 === c1 + 1) return { r: r1, c: c1, rotation: 0 }
  if (r1 === r2 - 1 && c1 === c2) return { r: r1, c: c1, rotation: 90 }
  if (r1 === r2 && c2 === c1 - 1) return { r: r2, c: c2, rotation: 180 }
  if (r2 === r1 - 1 && c1 === c2) return { r: r2, c: c2, rotation: 270 }

  return { r: r1, c: c1, rotation: 0 }
}
