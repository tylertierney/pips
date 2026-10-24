import styles from './Header.module.scss'
import {
  LOCAL_STORAGE_PREFIX,
  type Difficulty,
  type Today,
} from '../../models/models'
import { cn, constructDateFromString, isSolved } from '../../utils/utils'
import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'

const games = gamesArr as Today[]

type HeaderProps = {
  today: Today
}

export const Header = ({ today }: HeaderProps) => {
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

  return (
    <div className={cn(styles.header)}>
      <div className={styles.dateAndId}>
        <span>#{today.index}</span>
        <h1 className={cn(styles.date)}>
          <b>
            {constructDateFromString(today.printDate).toLocaleDateString(
              'en-us',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              },
            )}
          </b>
          {result > 0 && (
            <span>
              &nbsp;
              {Array(result)
                .fill(null)
                .map(() => '⭐️')}
            </span>
          )}
        </h1>
      </div>
      <div className={styles.gameLinks}>
        {today.index > 1 && (
          <Link
            className={`hoverable-link ${styles.gameLink}`}
            to={`/games/${today.index - 1}`}
          >
            <span>&larr;</span> Previous Game
          </Link>
        )}
        {today.index < games.length && (
          <Link
            className={`hoverable-link ${styles.gameLink}`}
            to={`/games/${today.index + 1}`}
          >
            Next Game &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}
