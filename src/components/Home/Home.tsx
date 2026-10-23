import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'
import type { Today } from '../../models/models'
import styles from './Home.module.scss'
import { cn, constructDateFromString } from '../../utils/utils'

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
                <td className={`${styles.td} ${styles.result}`}></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
