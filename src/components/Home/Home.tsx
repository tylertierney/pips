import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'
import type { Today } from '../../models/models'
import styles from './Home.module.scss'
import { constructDateFromString } from '../../utils/utils'

const games = gamesArr as unknown as Today[]

export const Home = () => {
  return (
    <div className={styles.page}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            <th className={styles.th} scope='col'>
              Date
            </th>
            <th className={`${styles.th} ${styles.result}`} scope='col'>
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {(games as Today[]).map((gameFromJson, i) => {
            const today = gameFromJson as unknown as Today

            return (
              <tr key={i} className={styles.tr}>
                <td className={styles.td}>
                  <Link
                    style={{ color: 'var(--text-color)' }}
                    to={`/games/${today.printDate}`}
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
                <td className={`${styles.td} ${styles.completed}`}>
                  {/* {getBadge(getFoundWordsFromLocalStorage(game), game)} */}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
