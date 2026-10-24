import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'
import {
  LOCAL_STORAGE_PREFIX,
  type Difficulty,
  type Today,
} from '../../models/models'
import styles from './Home.module.scss'
import { cn, constructDateFromString, isSolved } from '../../utils/utils'

const games = gamesArr as unknown as Today[]

export const Home = () => {
  return (
    <div className={styles.page}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            <th className={cn(styles.th, styles.id)} scope='col'>
              ID
            </th>
            <th className={cn(styles.th)} scope='col'>
              Date
            </th>
            <th className={cn(styles.th, styles.result)} scope='col'>
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {(games as Today[]).map((gameFromJson, i) => {
            const today = gameFromJson as unknown as Today
            const fromLocalStorage = localStorage.getItem(
              LOCAL_STORAGE_PREFIX + today.printDate,
            )

            let result = 0
            if (fromLocalStorage) {
              const parsed = JSON.parse(fromLocalStorage)
              const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
              for (const difficulty of difficulties) {
                if (!parsed[difficulty]) continue
                if (isSolved(today[difficulty], parsed[difficulty]?.dominoes)) {
                  result++
                }
              }
            }

            if (today.index === 119) {
              console.log(result)
            }

            return (
              <tr key={i} className={styles.tr}>
                <td className={cn(styles.td, styles.id)}>{today.index}</td>
                <td className={styles.td}>
                  <Link
                    style={{ color: 'var(--text-color)' }}
                    to={`/games/${today.index}`}
                    className='underline'
                  >
                    {constructDateFromString(
                      today.printDate,
                    ).toLocaleDateString('en-us', {
                      month: 'short',
                      year: 'numeric',
                      day: '2-digit',
                    })}
                  </Link>
                </td>
                <td className={`${styles.td} ${styles.result}`}>
                  {Array(result)
                    .fill(null)
                    .map(() => '⭐️')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
