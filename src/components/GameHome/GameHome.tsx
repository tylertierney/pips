import { Outlet, useLoaderData } from 'react-router-dom'
import type { Today } from '../../models/models'
import { Header } from '../Header/Header'

export const GameHome = () => {
  const today = useLoaderData() as Today

  return (
    <>
      <Header today={today} />
      <Outlet context={{ today }} />
    </>
  )
}
