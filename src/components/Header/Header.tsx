import styles from './Header.module.scss'
import type { Today } from '../../models/models'
import { cn, constructDateFromString } from '../../utils/utils'
import { Link } from 'react-router-dom'
import gamesArr from '../../../games.json'

const games = gamesArr as Today[]

type HeaderProps = {
  today: Today
}

export const Header = ({ today }: HeaderProps) => {
  return (
    <div className={cn(styles.header)}>
      <div className={styles.dateAndId}>
        <span>#{today.index}</span>
        <h1 className={styles.date}>
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
