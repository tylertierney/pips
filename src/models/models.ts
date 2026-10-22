export type RegionType =
  'equals' | 'unequal' | 'sum' | 'empty' | 'less' | 'greater'

export type IDomino = [number, number]
export type Coords = [number, number]

export type Region = {
  indices: Array<Coords>
  type: RegionType
  target?: number
}

export type IGame = {
  backendId: string
  constructors: string
  dominoes: IDomino[]
  id: number
  regions: Region[]
  solution: Array<[Coords, Coords]>
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Today = {
  easy: IGame
  medium: IGame
  hard: IGame
  editor: string
  printDate: string
  index: number
}

export const LOCAL_STORAGE_PREFIX = 'pips-state-'
