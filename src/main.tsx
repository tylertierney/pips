import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { GameHome } from './components/GameHome/GameHome.tsx'
import _today from './game2.json'
import type { Today } from './models/models.ts'
import { Game } from './components/GameHome/Game/Game.tsx'

const today = _today as Today

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Home</div>,
      },
      {
        path: 'games/:gameIndex',
        element: <GameHome />,
        loader: ({ params }) => {
          return { ...today, index: parseInt(params.gameIndex ?? '0', 10) || 0 }
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
