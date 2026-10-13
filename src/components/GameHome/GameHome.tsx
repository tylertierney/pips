import { useLoaderData } from 'react-router-dom'
import type { Difficulty, Today } from '../../models/models'
import { Game } from './Game/Game'
import { useState } from 'react'

export const GameHome = () => {
  const today = useLoaderData() as Today
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')

  return (
    <>
      <div className='flex items-center gap-12'>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
          <button
            className='border py-1 px-4'
            key={difficulty}
            onClick={() => setDifficulty(difficulty)}
          >
            {difficulty}
          </button>
        ))}
      </div>
      <Game today={today} difficulty={difficulty} />
    </>
  )
}
