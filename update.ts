// import { addDays } from 'date-fns'
import fs from 'fs'
import _gamesArr from './games.json'

const gamesArr = _gamesArr as Today[]

// Duplicate models
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
  status?: string
}
//////////////

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

const games = gamesArr as Today[]

const getNewGame = async (date: Date) => {
  const formattedDate = formatDate(date)

  const url = `https://www.nytimes.com/svc/pips/v1/${formattedDate}.json`

  try {
    const response = await fetch(url)
    const today = (await response.json()) as Today

    console.log(today)

    if (today.printDate && today.easy && today.medium && today.hard) {
      games.unshift({ ...today, index: games.length + 1 })

      fs.writeFileSync('games.json', JSON.stringify(games, null, 2))
    }
  } catch (err) {
    console.log(`Failed to fetch newest game`, err)
    return
  }
}

getNewGame(new Date())

// const getAllGames = async () => {
//   let start = new Date('2026-8-1')
//   // let end = new Date('2026-10-24')
//   let end = new Date('2026-10-24')
//   let gamesArr2: Today[] = []

//   while (start < end) {
//     console.log(start)
//     try {
//       const res = await fetch(
//         `https://www.nytimes.com/svc/pips/v1/${formatDate(start)}.json`,
//       )
//       const fetchedGame = (await res.json()) as Today
//       if (fetchedGame && fetchedGame.status === 'ERROR') throw Error('failed')
//       gamesArr2.unshift(fetchedGame)
//     } catch {}

//     start = addDays(start, 1)
//   }

//   const allGames = [...gamesArr, ...gamesArr2]
//     .toSorted((a, b) => b.printDate.localeCompare(a.printDate))
//     .map((g, index, arr) => ({
//       ...g,
//       index: arr.length - index,
//     }))

//   fs.writeFileSync('games.json', JSON.stringify(allGames, null, 2))
// }

// getAllGames()

// // const res = gamesArr.map((_, i) => ({ ..._, index: gamesArr.length - i }))

// // console.log(res[0], res[res.length - 1])
// // fs.writeFileSync('games.json', JSON.stringify(res, null, 2))
