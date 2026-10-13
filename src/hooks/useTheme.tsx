import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

export default function useTheme() {
  const [lightTheme, setLightTheme] = useState(false)

  useEffect(() => {
    if (JSON.parse(localStorage.getItem('light-theme') ?? 'false') === true) {
      document.body.classList.add('light-theme')
      setLightTheme(true)
    }
  }, [])

  useEffect(() => {
    if (lightTheme) {
      localStorage.setItem('light-theme', JSON.stringify(true))
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
      localStorage.setItem('light-theme', JSON.stringify(false))
    }
  }, [lightTheme])

  return [lightTheme, setLightTheme] as [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ]
}
