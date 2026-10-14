import React from 'react'
import type { Region, RegionType } from '../../models/models'

const colors = ['purple', 'pink', 'light-blue', 'orange', 'blue', 'green']

type RegionsProps = {
  cellSize: number
  regions: Region[]
  gridWidth: number
  gridHeight: number
}

const regionTypeToSymbol: Record<RegionType, string> = {
  empty: '',
  equals: '=',
  greater: '>',
  less: '<',
  sum: '',
  unequal: '≠',
}

export const Regions = ({
  cellSize,
  regions,
  gridWidth,
  gridHeight,
}: RegionsProps) => {
  return (
    <>
      {regions
        .filter(({ type }) => type !== 'empty')
        .map(({ indices, type, target = '' }, i) => {
          const regionCells = new Set(indices.map((coords) => String(coords)))
          const color = colors[i % colors.length]

          return (
            <React.Fragment key={i}>
              {indices.map(([r, c]) => {
                const neighbors = {
                  top: r > 0 && regionCells.has(String([r - 1, c])),
                  right:
                    c < gridWidth - 1 && regionCells.has(String([r, c + 1])),
                  bottom:
                    r < gridHeight - 1 && regionCells.has(String([r + 1, c])),
                  left: c > 0 && regionCells.has(String([r, c - 1])),
                }

                const isBottomRightCell =
                  r === Math.max(...indices.map(([r]) => r)) &&
                  c === Math.max(...indices.map(([_, c]) => c))

                return (
                  <div
                    key={`region-${r}-${c}`}
                    style={{
                      height: cellSize + 'px',
                      width: cellSize + 'px',
                      top: r * cellSize + 'px',
                      left: c * cellSize + 'px',
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      //
                      touchAction: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        background: `var(--bg-pips-region-${color})`,
                        borderColor: `var(--stroke-pips-region-${color})`,
                        borderWidth: '2px',
                        borderTopStyle: 'dashed',
                        borderRightStyle: 'dashed',
                        borderBottomStyle: 'dashed',
                        borderLeftStyle: 'dashed',
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        right: '2px',
                        bottom: '2px',
                        ...(neighbors.top
                          ? { borderTopStyle: 'none', top: 0 }
                          : {}),
                        ...(neighbors.right
                          ? { borderRightStyle: 'none', right: 0 }
                          : {}),
                        ...(neighbors.bottom
                          ? { borderBottomStyle: 'none', bottom: 0 }
                          : {}),
                        ...(neighbors.left
                          ? { borderLeftStyle: 'none', left: 0 }
                          : {}),

                        borderTopLeftRadius: '0.5em',
                        borderTopRightRadius: '0.5em',
                        borderBottomRightRadius: '0.5em',
                        borderBottomLeftRadius: '0.5em',
                        ...(neighbors.top
                          ? {
                              borderTopLeftRadius: '0',
                              borderTopRightRadius: '0',
                            }
                          : {}),
                        ...(neighbors.right
                          ? {
                              borderTopRightRadius: '0',
                              borderBottomRightRadius: '0',
                            }
                          : {}),
                        ...(neighbors.bottom
                          ? {
                              borderBottomRightRadius: '0',
                              borderBottomLeftRadius: '0',
                            }
                          : {}),
                        ...(neighbors.left
                          ? {
                              borderBottomLeftRadius: '0',
                              borderTopLeftRadius: '0',
                            }
                          : {}),
                      }}
                    >
                      {isBottomRightCell && (
                        <div
                          style={{
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            fontWeight: 'bold',
                            color: 'white',
                            top: '70%',
                            left: '70%',
                            height: '80%',
                            width: '80%',
                            fontSize: 'min(1.25em, 100%)',
                            backgroundColor: `var(--stroke-pips-region-${color})`,
                            clipPath: `polygon( 9.033% 35.294%, 3.446% 40.881%, 3.446% 40.881%, 2.205% 42.339%, 1.24% 43.934%, 0.551% 45.632%, 0.138% 47.399%, -0% 49.2%, 0.138% 51.001%, 0.551% 52.767%, 1.24% 54.465%, 2.205% 56.06%, 3.446% 57.519%, 40.881% 94.954%, 40.881% 94.954%, 42.339% 96.194%, 43.934% 97.159%, 45.632% 97.848%, 47.399% 98.262%, 49.2% 98.4%, 51.001% 98.262%, 52.767% 97.848%, 54.465% 97.159%, 56.06% 96.194%, 57.519% 94.954%, 94.954% 57.519%, 94.954% 57.519%, 96.194% 56.06%, 97.159% 54.465%, 97.848% 52.767%, 98.262% 51.001%, 98.4% 49.2%, 98.262% 47.399%, 97.848% 45.632%, 97.159% 43.934%, 96.194% 42.339%, 94.954% 40.881%, 57.519% 3.446%, 57.519% 3.446%, 56.06% 2.205%, 54.465% 1.24%, 52.767% 0.551%, 51.001% 0.138%, 49.2% -0%, 47.399% 0.138%, 45.632% 0.551%, 43.934% 1.24%, 42.339% 2.205%, 40.881% 3.446%, 38.235% 6.091%, 38.235% 17.647%, 38.235% 17.647%, 38.004% 20.51%, 37.336% 23.225%, 36.266% 25.757%, 34.83% 28.069%, 33.067% 30.125%, 31.01% 31.889%, 28.698% 33.324%, 26.166% 34.394%, 23.451% 35.063%, 20.588% 35.294%, 9.033% 35.294% )`,
                            aspectRatio: 1 / 1,
                            userSelect: 'none',
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                type === 'equals' || type === 'unequal'
                                  ? '1.4em'
                                  : '',

                              fontFamily: 'monospace',
                            }}
                          >
                            {regionTypeToSymbol[type]}
                          </span>

                          {type !== 'equals' && type !== 'unequal' && (
                            <>
                              <span className=''>{target}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
          )
        })}
    </>
  )
}
