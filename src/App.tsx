import { Outlet } from 'react-router-dom'
import useTheme from './hooks/useTheme'
import { sunIcon } from './svg/sun'
import { moonIcon } from './svg/moon'

function App() {
  const [lightTheme, setLightTheme] = useTheme()

  return (
    <>
      <nav className='flex justify-end px-4 py-2'>
        <button
          onClick={() => setLightTheme((prev) => !prev)}
          className='border-gray-400 rounded-sm'
        >
          {lightTheme ? moonIcon : sunIcon}
        </button>
      </nav>
      <Outlet />
    </>
  )
}

export default App
