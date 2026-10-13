export type RegionType =
  'equals' | 'unequal' | 'sum' | 'empty' | 'less' | 'greater'

export type IDomino = [number, number]
export type Coords = [number, number]

export type Region = {
  indices: Array<Coords>
  type: RegionType
  target?: number
}

export type Game = {
  backendId: string

  constructors: string
  dominoes: IDomino[]
  id: number

  regions: Region[]
  solution: Array<[Coords, Coords]>
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Today = {
  easy: Game
  medium: Game
  hard: Game
  editor: string
  printDate: string
  index: number
}
