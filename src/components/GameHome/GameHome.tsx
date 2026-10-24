import { Outlet, useLoaderData, useLocation } from 'react-router-dom'
import type { Today } from '../../models/models'
import { Header } from '../Header/Header'

export const GameHome = () => {
  const today = useLoaderData() as Today
  const location = useLocation()

  return (
    <>
      <Header today={today} />
      <Outlet key={location.pathname} context={{ today }} />
    </>
  )
}
