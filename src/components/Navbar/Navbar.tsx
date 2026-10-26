import { Link } from 'react-router-dom'
import { moonIcon } from '../../svg/moon'
import { sunIcon } from '../../svg/sun'
import styles from './Navbar.module.scss'
import useTheme from '../../hooks/useTheme'

export const Navbar = () => {
  const [darkTheme, setDarkTheme] = useTheme()

  return (
    <>
      <nav className={styles.navbar}>
        <Link className={styles.logo} to=''>
          pips
        </Link>
        <div className={styles.icons}>
          <button
            className={styles.button}
            onClick={() => setDarkTheme((prev) => !prev)}
          >
            {darkTheme ? sunIcon : moonIcon}
          </button>
        </div>
      </nav>
    </>
  )
}
