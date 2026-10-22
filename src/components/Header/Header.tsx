import styles from './Header.module.scss'
import type { Today } from '../../models/models'
import { cn, constructDateFromString } from '../../utils/utils'

type HeaderProps = {
  today: Today
}

export const Header = ({ today }: HeaderProps) => {
  return (
    <div className={cn(styles.header)}>
      <h1 className={styles.date}>
        {constructDateFromString(today.printDate).toLocaleDateString('en-us', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </h1>
    </div>
  )
}
