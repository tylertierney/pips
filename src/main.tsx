import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouterProvider,
} from 'react-router-dom'
import { GameHome } from './components/GameHome/GameHome.tsx'
import gamesArr from '../games.json'
import type { Today } from './models/models.ts'
import { Game } from './components/GameHome/Game/Game.tsx'
import { Home } from './components/Home/Home.tsx'

const games = gamesArr as Today[]

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'games/:printDate',
        element: <GameHome />,
        loader: ({ params }) => {
          const today = games.find(
            ({ printDate }) => printDate === params.printDate,
          )

          if (!today) {
            throw redirect('/')
          }
          return today
          // return { ...today, index: parseInt(params.printDate ?? '0', 10) || 0 }
        },
        children: [
          {
            path: ':difficulty',
            element: <Game />,
          },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
