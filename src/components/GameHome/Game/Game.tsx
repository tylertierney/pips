import JSConfetti from 'js-confetti'
const jsConfetti = new JSConfetti()

import { useEffect, useRef, useState } from 'react'
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
  cn,
  convertGameDominoesToUiDominoes,
  deriveRotatedDominoFromIndices,
  getStarCount,
  getTranslateFromRotation,
  isSolved,
} from '../../../utils/utils'
import { Domino } from '../../Domino/Domino'
import { Regions } from '../../Regions/Regions'
import styles from './Game.module.scss'
import { usePointerEvents } from './usePointerEvents'
import type { GameOutletContext } from '../GameHome'

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
  const { today, setStarCount } = useOutletContext<GameOutletContext>()
  const { difficulty } = useParams() as { difficulty: Difficulty }
  const game = today[difficulty]

  const { height, width, cellSize, cells } = useGridBuilder(game)

  const [dominoes, setDominoes] = useState<UiDomino[]>(
    getDominoesFromLocalStorage(today, game, difficulty),
  )

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

    setStarCount(getStarCount(today))
  }, [dominoes])

  const placedDominoes = dominoes.filter(
    ({ r, c }) => r !== undefined && c !== undefined,
  )

  const { dragState, onPointerDown, onPointerMove, onClick } = usePointerEvents(
    {
      dominoes,
      setDominoes,
      cellSize,
      game,
    },
  )

  const draggedDomino = dominoes.find((d) => d.id === dragState?.dominoId)

  const solved = isSolved(game, dominoes)

  const gameCompleteRef = useRef(isSolved(game, dominoes))

  useEffect(() => {
    if (!gameCompleteRef.current && solved) {
      jsConfetti.addConfetti()
      gameCompleteRef.current = true
    }
  }, [solved])

  const reset = () => {
    setDominoes(convertGameDominoesToUiDominoes(game.dominoes))
    gameCompleteRef.current = false
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
                    touchAction: solved ? 'all' : 'none',
                    pointerEvents:
                      dragState && dragState.dominoId !== uiDomino.id
                        ? 'none'
                        : 'all',
                  }}
                />
              ) : null
            })}
            <Regions
              submitted={dominoes.every(
                ({ r, c }) => r !== undefined && c !== undefined,
              )}
              cellSize={cellSize}
              game={game}
              dominoes={dominoes}
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
                        touchAction: solved ? 'all' : 'none',
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
            className='select-none'
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
              touchAction: solved ? 'all' : 'none',
            }}
          />
        )}
      </div>
      <button className={cn(styles.resetButton)} onClick={reset}>
        Reset
      </button>
      <span
        className='underline self-center cursor-pointer mb-16'
        onClick={() => {
          const solution = game.solution

          setDominoes((prev) =>
            prev.map((d, i) => ({
              ...d,
              ...deriveRotatedDominoFromIndices(solution[i]),
            })),
          )
        }}
      >
        Too hard? Reveal the solution
      </span>
    </div>
  )
}
