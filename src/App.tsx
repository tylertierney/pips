import { Outlet } from 'react-router-dom'
import useTheme from './hooks/useTheme'
import { sunIcon } from './svg/sun'
import { moonIcon } from './svg/moon'
import { Navbar } from './components/Navbar/Navbar'

function App() {
  const [lightTheme, setLightTheme] = useTheme()

  return (
    <>
      {/* <nav className='flex justify-end px-4 py-2'>
        <button
          onClick={() => setLightTheme((prev) => !prev)}
          className='border-gray-400 rounded-sm'
        >
          {lightTheme ? moonIcon : sunIcon}
        </button>
      </nav> */}
      <Navbar />
      <Outlet />
    </>
  )
}

export default App
