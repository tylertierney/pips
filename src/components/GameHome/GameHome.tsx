import { Link, Outlet, useLoaderData } from 'react-router-dom'
import type { Difficulty, Today } from '../../models/models'

export const GameHome = () => {
  const today = useLoaderData() as Today

  return (
    <>
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
