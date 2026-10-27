import {
  useEffect,
  useState,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from 'react'
import type { IDomino, IGame } from '../../../models/models'
import type { UiDomino } from './Game'
import {
  clickedDomino,
  isValidPlacement,
  traverseStackToFindCell,
} from '../../../utils/utils'

const resetInvalidDominoes = (
  setDominoes: Dispatch<SetStateAction<UiDomino[]>>,
  game: IGame,
  clickedOnDominoId: number | undefined,
) => {
  setDominoes((arr) =>
    arr.map((d) => {
      if (clickedOnDominoId === d.id) return d

      const isPlaced = d.r !== undefined || d.c !== undefined
      const isSelected = Boolean(d.selected)

      const validPlacementParams: Parameters<typeof isValidPlacement>[0] = {
        targetR: d.r as number,
        targetC: d.c as number,
        dominoes: arr,
        dominoId: d.id,
        game,
        rotation: d.rotation,
      }

      if (isPlaced && isSelected && !isValidPlacement(validPlacementParams)) {
        let newRotation = 90
        while (newRotation < 360) {
          if (
            isValidPlacement({
              ...validPlacementParams,
              rotation: d.rotation + newRotation,
            })
          ) {
            return {
              ...d,
              selected: false,
              rotation: d.rotation + newRotation,
            }
          }
          newRotation += 90
        }
        return { ...d, selected: false, r: undefined, c: undefined }
      }

      return d
    }),
  )
}

type UsePointerEventsProps = {
  dominoes: UiDomino[]
  setDominoes: Dispatch<SetStateAction<UiDomino[]>>
  cellSize: number
  game: IGame
}

export const usePointerEvents = ({
  dominoes,
  setDominoes,
  cellSize,
  game,
}: UsePointerEventsProps) => {
  const [dragState, setDragState] = useState<{
    top: number
    left: number
    offsetX: number
    offsetY: number
    dominoId: number
    rotation: number
    domino: IDomino
  } | null>(null)
  const [isHoldingDownMouse, setIsHoldingDownMouse] = useState(false)

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsHoldingDownMouse(true)
  }

  const onPointerMove = (
    e: PointerEvent<HTMLDivElement>,
    uiDomino: UiDomino,
  ) => {
    if (dragState?.dominoId) return

    const movement = Math.max(Math.abs(e.movementX), Math.abs(e.movementY))

    if (isHoldingDownMouse && movement > 2) {
      const targetRect = e.currentTarget.getBoundingClientRect()

      setDragState({
        dominoId: uiDomino.id,
        top: e.clientY,
        left: e.clientX,
        offsetY: e.clientY - targetRect.top,
        offsetX: e.clientX - targetRect.left,
        rotation: uiDomino.rotation,
        domino: uiDomino.domino,
      })
    }
  }

  useEffect(() => {
    const cb = (e: MouseEvent) => {
      const clickedOnDomino = clickedDomino(e)

      if (dragState) {
        const coords = [
          dragState.left - dragState.offsetX + 0.5 * cellSize,
          dragState.top - dragState.offsetY + 0.5 * cellSize,
        ]
        const targetingTray = Boolean(
          document
            .elementsFromPoint(coords[0], coords[1])
            .find((el) => (el as HTMLElement).id === 'tray'),
        )

        if (targetingTray) {
          setDominoes((prev) =>
            prev.map((d) =>
              d.id === dragState.dominoId
                ? { ...d, r: undefined, c: undefined }
                : { ...d },
            ),
          )
        } else {
          const targetCellCoords = traverseStackToFindCell(coords[0], coords[1])
          if (targetCellCoords) {
            const [targetR, targetC] = targetCellCoords
            const valid = isValidPlacement({
              targetR,
              targetC,
              rotation: dragState.rotation,
              dominoId: dragState.dominoId,
              game,
              dominoes,
            })

            if (valid) {
              setDominoes((prev) =>
                prev.map((d) => {
                  if (d.id === dragState.dominoId) {
                    return { ...d, r: targetR, c: targetC, selected: false }
                  }

                  return {
                    ...d,
                  }
                }),
              )
            }
          }
        }

        setDominoes((prev) =>
          prev.map((d) => {
            const isInTray = d.r === undefined && d.c === undefined
            return {
              ...d,
              selected: false,
              rotation:
                isInTray && d.rotation % 180 ? d.rotation + 90 : d.rotation,
            }
          }),
        )
      }

      setDragState(null)
      setIsHoldingDownMouse(false)
      resetInvalidDominoes(setDominoes, game, clickedOnDomino)
      setDominoes((prev) => prev.map((d) => ({ ...d, selected: false })))
    }

    window.addEventListener('pointerup', cb)

    return () => window.removeEventListener('pointerup', cb)
  }, [dragState, game])

  useEffect(() => {
    const cb = (e: MouseEvent) => {
      setDragState((prev) =>
        prev ? { ...prev, top: e.clientY, left: e.clientX } : null,
      )
    }

    window.addEventListener('pointermove', cb)

    return () => window.removeEventListener('pointermove', cb)
  }, [])

  const onClick = (uiDomino: UiDomino) => {
    setDominoes((prev) =>
      prev.map((d) => {
        const isNewSelectedDomino = uiDomino.id === d.id
        const isInTray = d.r === undefined && d.c === undefined

        return {
          ...d,
          selected: uiDomino.id === d.id ? true : false,
          rotation: isNewSelectedDomino
            ? d.rotation + 90
            : isInTray && d.rotation % 180
              ? d.rotation + 90
              : d.rotation,
        }
      }),
    )
  }

  return { dragState, onPointerDown, onPointerMove, onClick }
}
