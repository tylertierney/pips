import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

export default function useTheme() {
  const [darkTheme, setDarkTheme] = useState(false)

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('dark-theme') ?? 'false') === true) {
      document.body.classList.add('dark-theme')
      setDarkTheme(true)
    }
  }, [])

  useEffect(() => {
    if (darkTheme) {
      localStorage.setItem('dark-theme', JSON.stringify(true))
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('dark-theme', JSON.stringify(false))
    }
  }, [darkTheme])

  return [darkTheme, setDarkTheme] as [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ]
}
