import { Link } from 'react-router-dom'
import { moonIcon } from '../../svg/moon'
import { sunIcon } from '../../svg/sun'
import styles from './Navbar.module.scss'
import useTheme from '../../hooks/useTheme'

export const Navbar = () => {
  const [lightTheme, setLightTheme] = useTheme()

  return (
    <>
      <nav className={styles.navbar}>
        <Link className={styles.logo} to=''>
          pips
        </Link>
        <div className={styles.icons}>
          {/* <button onClick={showModal} className={styles.button}>
            {questionMarkIcon}
          </button> */}
          <button
            className={styles.button}
            onClick={() => setLightTheme((prev) => !prev)}
          >
            {lightTheme ? moonIcon : sunIcon}
          </button>
        </div>
      </nav>
      {/* <dialog ref={modalRef} onClick={hideModal} className={styles.backdrop}>
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={styles.modal}
        >
          <div className={styles.modalHeader}>
            <h1 className={styles.modalTitle}>How to Play</h1>
            <svg
              onClick={hideModal}
              className={styles.closeIcon}
              xmlns='http://www.w3.org/2000/svg'
              xmlnsXlink='http://www.w3.org/1999/xlink'
              viewBox='0 0 50 50'
              role='button'
              aria-label='close modal'
              aria-roledescription="closes the 'how to play' modal"
            >
              <path
                stroke='inherit'
                fill='inherit'
                color='inherit'
                d='M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z'
              />
            </svg>
          </div>
          <article className={styles.modalBody}>
            <video
              className={styles.video}
              playsInline={true}
              autoPlay={true}
              loop={true}
              width={300}
            >
              <source src='/instructions.mp4' type='video/mp4'></source>
            </video>
            <section>
              <h2 className={styles.h2}>
                <b>Find theme words to fill the board.</b>
              </h2>
              <ul className={styles.ul}>
                <li className={styles.li}>
                  Theme words stay highlighted in blue when found.
                </li>
                <li className={styles.li}>
                  Drag or tap letters to create words. If tapping, double tap
                  the last letter to submit.
                </li>
                <li className={styles.li}>
                  Theme words fill the board entirely. No theme words overlap.
                </li>
              </ul>
            </section>
            <section>
              <h2 className={styles.h2}>
                <b>Find the "spangram".</b>
              </h2>
              <ul className={styles.ul}>
                <li className={styles.li}>
                  The spangram describes the puzzle’s theme and touches two
                  opposite sides of the board. It may be one or more words.
                </li>
                <li className={styles.li}>
                  The spangram highlights in yellow when found.
                </li>
                <li className={styles.li}>
                  An example spangram with corresponding theme words:{' '}
                  <span className={styles.blue}>LIME</span>,{' '}
                  <span className={styles.yellow}>FRUIT</span>,{' '}
                  <span className={styles.blue}>BANANA</span>,{' '}
                  <span className={styles.blue}>APPLE</span>, etc.
                </li>
              </ul>
            </section>
            <section>
              <h2 className={styles.h2}>
                <b>Need a hint?</b>
              </h2>
              <ul className={styles.ul}>
                <li className={styles.li}>
                  Find non-theme words to get hints.
                </li>
                <li className={styles.li}>
                  For every 3 non-theme words you find, you earn a hint.
                </li>
                <li className={styles.li}>
                  Hints show the letters of a theme word. If there is already an
                  active hint on the board, a hint will show that word’s letter
                  order.
                </li>
              </ul>
            </section>
          </article>
        </div>
      </dialog> */}
    </>
  )
}
