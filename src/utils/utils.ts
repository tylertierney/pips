import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'
import type { UiDomino } from '../components/GameHome/Game/Game'
import type { Coords, IDomino, IGame } from '../models/models'

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
  height,
  width,
  game,
  dominoes,
}: {
  targetR: number
  targetC: number
  dominoId: number
  rotation: number
  height: number
  width: number
  game: IGame
  dominoes: UiDomino[]
}): boolean => {
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
  width: number,
  height: number,
) => {
  return Array.from({ length: height }).map(() => Array.from({ length: width }))
}

export const isSolved = (game: IGame, uiDominoes: UiDomino[]) => {
  const dominoes = uiDominoes.toSorted((a, b) => a.id - b.id)

  let result = true
  dominoes.forEach((d) => {
    const normalized = deriveIndicesFromRotatedDomino(d)
    if (!normalized) {
      result = false
      return
    }

    const solved = game.solution[d.id]
    if (
      solved[0][0] !== normalized[0][0] ||
      solved[0][1] !== normalized[0][1] ||
      solved[1][0] !== normalized[1][0] ||
      solved[1][1] !== normalized[1][1]
    ) {
      result = false
    }
  })

  return result
  // game.solution.forEach()
}

export const constructDateFromString = (str: string): Date => {
  const [year, month, day] = str.split('-').map(Number)
  const correctDate = new Date(year, month - 1, day)
  return correctDate
}
