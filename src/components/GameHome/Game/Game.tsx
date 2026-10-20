import styles from './Game.module.scss'
import {
  cn,
  convertGameDominoesToUiDominoes,
  getTranslateFromRotation,
  isPlacedInBounds,
  isValidPlacement,
  isVertical,
  traverseStackToFindCell,
} from '../../../utils/utils'
import type { Difficulty, IDomino, Today } from '../../../models/models'
import { useEffect, useState, type PointerEvent } from 'react'
import { Domino } from '../../Domino/Domino'
import { Regions } from '../../Regions/Regions'
import { useOutletContext, useParams } from 'react-router-dom'
import { useGridBuilder } from '../../../hooks/useGridBuilder'

export type UiDomino = {
  id: number
  r?: number
  c?: number
  rotation: number // 0 90 180 270
  domino: IDomino
  selected?: boolean
}

export const Game = () => {
  const { today } = useOutletContext<{ today: Today }>()
  const { difficulty } = useParams() as { difficulty: Difficulty }
  const game = today[difficulty]

  const { height, width, cellSize, cells } = useGridBuilder(game)

  const [dominoes, setDominoes] = useState<UiDomino[]>(
    convertGameDominoesToUiDominoes(game.dominoes),
  )

  useEffect(() => {
    setDominoes(convertGameDominoesToUiDominoes(game.dominoes))
  }, [game])

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
    rotation: number
    domino: IDomino
  } | null>(null)

  const draggedDomino = dominoes.find((d) => d.id === dragState?.dominoId)

  useEffect(() => {
    const cb = (e: MouseEvent) => {
      setDragState((prev) =>
        prev ? { ...prev, top: e.clientY, left: e.clientX } : null,
      )
    }

    window.addEventListener('pointermove', cb)

    return () => window.removeEventListener('pointermove', cb)
  }, [])

  useEffect(() => {
    const cb = () => {
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
              width,
              height,
              game,
              dominoes,
            })

            if (valid) {
              setDominoes((prev) =>
                prev.map((d) => {
                  if (d.id === dragState.dominoId) {
                    return { ...d, r: targetR, c: targetC, selected: false }
                  }
                  // const isInTray = d.r === undefined && d.c === undefined

                  return {
                    ...d,
                    // rotation:
                    //   isInTray && d.rotation % 180
                    //     ? d.rotation + 90
                    //     : d.rotation,
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
      setDominoes((arr) => arr.map((d) => ({ ...d, selected: false })))
    }

    window.addEventListener('pointerup', cb)

    return () => window.removeEventListener('pointerup', cb)
  }, [dragState, game])

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

  return (
    <div className='flex flex-col justify-center items-center grow px-2'>
      <div className={cn('relative my-16', styles.container)}>
        <div
          className='select-none'
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            zIndex: 0,
          }}
        >
          {cells.map((cell) => {
            const { r, c, isBackgroundCell, ...style } = cell
            const coords = [r, c]

            return (
              <div
                key={r * width + c}
                data-coords={JSON.stringify(coords)}
                className={cn(
                  'flex justify-center items-center aspect-square z-0 overflow-hidden select-none',
                  styles.cell,
                  isBackgroundCell && styles.backgroundCell,
                )}
                style={{ ...style }}
              >
                {!isBackgroundCell && cell.cornerSvgs.map((svg) => svg)}
              </div>
            )
          })}

          {placedDominoes.map((uiDomino) => {
            const { r: _r, c: _c, id, domino, rotation } = uiDomino
            const r = _r as number
            const c = _c as number
            return dragState?.dominoId !== uiDomino.id ? (
              <Domino
                selected={uiDomino.selected}
                id={id}
                key={id}
                domino={domino}
                rotation={rotation}
                className='absolute'
                cellSize={cellSize}
                onClick={() => onClick(uiDomino)}
                onPointerDown={onPointerDown}
                onPointerMove={
                  !dragState?.dominoId
                    ? (e) => onPointerMove(e, uiDomino)
                    : undefined
                }
                style={{
                  top: r * cellSize + 'px',
                  left: c * cellSize + 'px',
                  rotate: (rotation ?? 0) + 'deg',
                  transformOrigin: 'top left',
                  translate: getTranslateFromRotation(rotation),
                  touchAction: 'none',
                  pointerEvents:
                    dragState && dragState.dominoId !== uiDomino.id
                      ? 'none'
                      : 'all',
                  ...(uiDomino.selected
                    ? {
                        transformOrigin: `${0.5 * cellSize}px ${0.5 * cellSize}px`,
                        // transformOrigin: `50% 50%`,
                        translate: 0,
                      }
                    : {}),
                }}
              />
            ) : null
          })}
          <Regions
            regions={game.regions}
            cellSize={cellSize}
            gridHeight={height}
            gridWidth={width}
          />
        </div>
      </div>
      <div className='h-0.5 w-full bg-gray-200'></div>
      <div
        className='flex gap-3 px-6 justify-center flex-wrap py-16 select-none'
        id='tray'
      >
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
                    selected={uiDomino.selected}
                    id={uiDomino.id}
                    idPrefix='tray'
                    onPointerMove={(e) => onPointerMove(e, uiDomino)}
                    onPointerDown={onPointerDown}
                    onClick={() => onClick(uiDomino)}
                    cellSize={cellSize}
                    domino={uiDomino.domino}
                    className='p-0'
                    style={{
                      height: cellSize + 'px',
                      width: 2 * cellSize + 'px',
                      flexShrink: 0,
                      marginLeft: -1 * 0.1 * cellSize + 'px',
                      touchAction: 'none',
                      zIndex: 0,
                      rotate: (uiDomino.rotation ?? 0) + 'deg',
                      ...(uiDomino.selected
                        ? {
                            zIndex: 1,
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
            opacity: 0.8,
            transformOrigin: 'top left',
            translate: getTranslateFromRotation(draggedDomino.rotation),
            scale: 1.2,
            // transformOrigin: `${0.5 * cellSize}px ${0.5 * cellSize}px`,
            // translate: isVertical(dragState.rotation) ? `0 -50%` : `50% 0%`,
            // scale: 1,
            zIndex: 1,
          }}
        />
      )}
      {dragState && draggedDomino && (
        <>
          {/* <span
            style={{
              position: 'fixed',
              top: dragState.top - dragState.offsetY + 0.5 * cellSize,
              left: dragState.left - dragState.offsetX + 0.5 * cellSize,
              height: '6px',
              width: '6px',
              borderRadius: '100%',
              background: 'red',
              zIndex: 1,
            }}
          ></span> */}
          {/* <span
            style={{
              position: 'fixed',
              top: isVertical(dragState.rotation)
                ? dragState.top - dragState.offsetY + 1.5 * cellSize
                : dragState.top - dragState.offsetY + 0.5 * cellSize,
              left: isVertical(dragState.rotation)
                ? dragState.left - dragState.offsetX + 0.5 * cellSize
                : dragState.left - dragState.offsetX + 1.5 * cellSize,

              height: '6px',
              width: '6px',
              borderRadius: '100%',
              background: 'red',
              zIndex: 1,
            }}
          ></span> */}
        </>
      )}
    </div>
  )
}
