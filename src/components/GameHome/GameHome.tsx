import { Link, Outlet, useLoaderData } from 'react-router-dom'
import type { Difficulty, Today } from '../../models/models'
import { Header } from '../Header/Header'

export const GameHome = () => {
  const today = useLoaderData() as Today

  return (
    <>
      <Header today={today} />
      <div className='flex items-center gap-12'>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
          <Link
            to={'./' + difficulty}
            className='border py-1 px-4'
            key={difficulty}
          >
            {difficulty}
          </Link>
        ))}
      </div>
      <Outlet context={{ today }} />
    </>
  )
}
