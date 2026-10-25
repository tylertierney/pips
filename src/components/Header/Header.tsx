import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'
import { type Today } from '../../models/models'
import { cn, constructDateFromString, getStarCount } from '../../utils/utils'
import styles from './Header.module.scss'

const games = gamesArr as Today[]

type HeaderProps = {
  today: Today
}

export const Header = ({ today }: HeaderProps) => {
  const starCount = getStarCount(today)

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
          {starCount > 0 && (
            <span>
              &nbsp;
              {Array(starCount)
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
