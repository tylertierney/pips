import styles from './Game.module.scss'
import { cn, getTranslateFromRotation } from '../../../utils/utils'
import type { IDomino, Today } from '../../../models/models'
import {
  BottomLeftCorner,
  BottomRightCorner,
  TopLeftCorner,
  TopRightCorner,
} from '../../CornerSvg/CornerSvg'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Domino } from '../../Domino/Domino'
import { useCellSize } from '../../../hooks/useCellSize'

type UiDomino = {
  id: number
  r?: number
  c?: number
  rotation: number // 0 90 180 270
  domino: IDomino
  selected?: boolean
}

type GameProps = {
  today: Today
  difficulty: 'easy' | 'medium' | 'hard'
}

export const Game = ({ today, difficulty }: GameProps) => {
  const game = today[difficulty]

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

  const [dominoes, setDominoes] = useState<UiDomino[]>(
    game.dominoes.map((d, idx) => {
      const res = { id: idx, domino: d, rotation: 0 }
      if (idx === 0) {
        return { ...res, r: 0, c: 0, rotation: 0 }
      }
      if (idx === 1) {
        return { ...res, r: 1, c: 2, rotation: 270 }
      }
      return res
    }),
  )

  const placedDominoes = dominoes.filter(
    ({ r, c }) => r !== undefined && c !== undefined,
  )

  const [isHoldingDownMouse, setIsHoldingDownMouse] = useState(false)

  const [dragState, setDragState] = useState<{
    top: number
    left: number
    offsetX: number
    offsetY: number
    dominoId: number
  } | null>(null)

  const draggedDomino = dominoes.find((d) => d.id === dragState?.dominoId)

  useEffect(() => {
    const cb = (e: MouseEvent) => {
      setDragState((prev) =>
        prev ? { ...prev, top: e.clientY, left: e.clientX } : null,
      )
      if (isHoldingDownMouse) {
        document.body.style.overflowY = 'hidden'
        document.body.style.touchAction = 'none'
        document.body.style.overscrollBehavior = 'contain'
      }
    }

    window.addEventListener('pointermove', cb)

    return () => window.removeEventListener('pointermove', cb)
  }, [])

  useEffect(() => {
    const cb = () => {
      setDragState(null)
      setIsHoldingDownMouse(false)
      document.body.style.overflowY = 'auto'
      document.body.style.touchAction = 'unset'
      document.body.style.overscrollBehavior = 'unset'
    }
    window.addEventListener('pointerup', cb)

    return () => window.removeEventListener('pointerup', cb)
  }, [])

  return (
    <div className='flex flex-col justify-center items-center grow gap-16 px-[8px]'>
      <div className={cn('relative', styles.container)}>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          }}
        >
          {cells.map((cell) => {
            const { r, c, isBackgroundCell, ...style } = cell
            const coords = [r, c]
            const stringCoords = String(coords)

            return (
              <div
                key={r * width + c}
                data-coords={stringCoords}
                className={cn(
                  'flex justify-center items-center aspect-square z-0 overflow-hidden select-none',
                  styles.cell,
                  isBackgroundCell && styles.backgroundCell,
                )}
                style={{ ...style }}
              >
                <span className='text-xs text-gray-600'>{stringCoords}</span>
                {!isBackgroundCell && cell.cornerSvgs.map((svg) => svg)}
              </div>
            )
          })}

          {placedDominoes.map(({ id, rotation, domino, r: _r, c: _c }) => {
            const r = _r as number
            const c = _c as number
            return (
              <Domino
                id={id}
                key={id}
                domino={domino}
                rotation={rotation}
                className='absolute'
                cellSize={cellSize}
                style={{
                  top: r * cellSize + 'px',
                  left: c * cellSize + 'px',
                  rotate: (rotation ?? 0) + 'deg',
                  transformOrigin: 'top left',
                  translate: getTranslateFromRotation(rotation),
                }}
              />
            )
          })}
        </div>
      </div>
      <div className='h-0.5 w-full bg-gray-200'></div>
      <div className='flex gap-3 px-6 justify-center flex-wrap'>
        {dominoes.map((uiDomino, idx) => {
          return (
            <div
              className='flex items-center rounded-md relative select-none'
              style={{
                backgroundColor: '#dbc2b9',
                height: 0.9 * cellSize + 'px',
                width: 0.9 * (2 * cellSize) + 'px',
              }}
              key={idx}
            >
              {!placedDominoes.find(({ id }) => id === idx) &&
                dragState?.dominoId !== uiDomino.id && (
                  <Domino
                    id={uiDomino.id}
                    idPrefix='tray'
                    onPointerMove={(e) => {
                      const movement = Math.max(
                        Math.abs(e.movementX),
                        Math.abs(e.movementY),
                      )

                      if (isHoldingDownMouse && movement > 2) {
                        const targetRect =
                          e.currentTarget.getBoundingClientRect()

                        setDragState({
                          dominoId: uiDomino.id,
                          top: e.clientY,
                          left: e.clientX,
                          offsetY: e.clientY - targetRect.top,
                          offsetX: e.clientX - targetRect.left,
                        })
                      }
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId)
                      setIsHoldingDownMouse(true)
                    }}
                    onClick={() => {
                      setDominoes((prev) =>
                        prev.map((d) => {
                          const isNewSelectedDomino = uiDomino.id === d.id
                          const isInTray =
                            d.r === undefined && d.c === undefined

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
                    }}
                    cellSize={cellSize}
                    domino={uiDomino.domino}
                    className='p-0'
                    style={{
                      height: cellSize + 'px',
                      width: 2 * cellSize + 'px',
                      flexShrink: 0,
                      marginLeft: -1 * 0.1 * cellSize + 'px',
                      rotate: (uiDomino.rotation ?? 0) + 'deg',
                      touchAction: 'none',
                      ...(uiDomino.selected
                        ? {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transformOrigin: 'center',
                            opacity: 0.8,
                          }
                        : {}),
                    }}
                  />
                )}
            </div>
          )
        })}
      </div>
      {dragState && draggedDomino && (
        <Domino
          id={draggedDomino.id}
          domino={draggedDomino.domino}
          cellSize={cellSize}
          className='touch-none select-none'
          style={{
            position: 'fixed',
            top: dragState.top - dragState.offsetY,
            left: dragState.left - dragState.offsetX,
            transition: 'none',
            rotate: draggedDomino.rotation + 'deg',
            transformOrigin: 'top left',
            opacity: 0.8,
            translate: getTranslateFromRotation(draggedDomino.rotation),
            scale: 1,
            touchAction: 'none',
          }}
        />
      )}
    </div>
  )
}
