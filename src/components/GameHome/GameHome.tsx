import { Outlet, useLoaderData, useLocation } from 'react-router-dom'
import type { Today } from '../../models/models'
import { Header } from '../Header/Header'
import { getStarCount } from '../../utils/utils'
import { useState, type Dispatch, type SetStateAction } from 'react'

export type GameOutletContext = {
  today: Today
  setStarCount: Dispatch<SetStateAction<number>>
}

export const GameHome = () => {
  const today = useLoaderData() as Today
  const location = useLocation()

  const [starCount, setStarCount] = useState(getStarCount(today))

  return (
    <>
      <Header today={today} starCount={starCount} />
      <Outlet
        key={location.pathname}
        context={{ today, setStarCount } satisfies GameOutletContext}
      />
    </>
  )
}
