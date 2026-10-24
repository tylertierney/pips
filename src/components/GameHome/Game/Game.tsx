import {
  useEffect,
  useState,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useGridBuilder } from '../../../hooks/useGridBuilder'
import {
  LOCAL_STORAGE_PREFIX,
  type Difficulty,
  type IDomino,
  type IGame,
  type Today,
} from '../../../models/models'
import {
  clickedDomino,
  cn,
  convertGameDominoesToUiDominoes,
  getTranslateFromRotation,
  isSolved,
  isValidPlacement,
  traverseStackToFindCell,
} from '../../../utils/utils'
import { Domino } from '../../Domino/Domino'
import { Regions } from '../../Regions/Regions'
import styles from './Game.module.scss'

const resetInvalidDominoes = (
  setDominoes: Dispatch<SetStateAction<UiDomino[]>>,
  game: IGame,
  width: number,
  height: number,
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
        width,
        height,
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

const getDominoesFromLocalStorage = (
  today: Today,
  game: IGame,
  difficulty: Difficulty,
) => {
  const fromLocalStorage = localStorage.getItem(
    LOCAL_STORAGE_PREFIX + today.printDate,
  )

  if (fromLocalStorage) {
    const parsed = JSON.parse(fromLocalStorage)
    if (parsed && parsed[difficulty]?.dominoes) {
      return parsed[difficulty].dominoes
    }
  }

  return convertGameDominoesToUiDominoes(game.dominoes)
}

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
    getDominoesFromLocalStorage(today, game, difficulty),
  )

  useEffect(() => {
    setDominoes(getDominoesFromLocalStorage(today, game, difficulty))
  }, [game])

  useEffect(() => {
    const gameId = LOCAL_STORAGE_PREFIX + today.printDate
    const fromLocalStorage = localStorage.getItem(gameId)

    if (fromLocalStorage) {
      const parsed = JSON.parse(fromLocalStorage)
      localStorage.setItem(
        gameId,
        JSON.stringify({
          ...parsed,
          [difficulty]: { ...parsed[difficulty], dominoes },
        }),
      )
    } else {
      localStorage.setItem(
        gameId,
        JSON.stringify({ [difficulty]: { dominoes } }),
      )
    }
  }, [dominoes, today, game])

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

      resetInvalidDominoes(setDominoes, game, width, height, clickedOnDomino)

      setDominoes((prev) => prev.map((d) => ({ ...d, selected: false })))
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

  const solved = isSolved(game, dominoes)

  const reset = () => {
    setDominoes(convertGameDominoesToUiDominoes(game.dominoes))
  }

  return (
    <div className='flex flex-col'>
      <div className={cn('flex', styles.tabs)}>
        {['Easy', 'Medium', 'Hard'].map((diff) => {
          return (
            <Link
              key={diff}
              to={'../' + diff.toLowerCase()}
              className={cn(
                styles.tab,
                difficulty === diff.toLowerCase() && styles.active,
              )}
              replace
            >
              {diff}
            </Link>
          )
        })}
      </div>

      <div className='flex flex-col justify-center items-center grow px-2 lg:flex-row lg:gap-16'>
        <div className={cn('relative my-16 lg:mr-14', styles.container)}>
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
                  {/* <pre className='text-[10px]'>{String(coords)}</pre> */}
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
                  disabled={solved}
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
        <div
          className='h-px w-full lg:h-auto lg:w-px self-stretch'
          style={{
            backgroundColor:
              'color-mix(in hsl, var(--color-primary) 25%, transparent)',
          }}
        ></div>
        <div
          className={cn(
            'flex gap-3 px-6 justify-center flex-wrap py-16 select-none',
            'lg:px-0',
            styles.tray,
          )}
          style={{ maxWidth: 2 * width * cellSize + 'px' }}
          id='tray'
        >
          {dominoes.map((uiDomino, idx) => {
            return (
              <div
                className={cn(
                  'flex items-center rounded-md relative select-none',
                  styles.trayItem,
                )}
                style={{
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
                      disabled={solved}
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
            disabled={solved}
            style={{
              position: 'fixed',
              top: dragState.top - dragState.offsetY,
              left: dragState.left - dragState.offsetX,
              transition: 'none',
              rotate: draggedDomino.rotation + 'deg',
              opacity: 0.8,
              transformOrigin: 'top left',
              translate: getTranslateFromRotation(draggedDomino.rotation),
              zIndex: 1,
            }}
          />
        )}
      </div>
      <button className={cn(styles.resetButton)} onClick={reset}>
        Reset
      </button>
    </div>
  )
}
