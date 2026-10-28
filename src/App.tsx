import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Navbar } from './components/Navbar/Navbar'

function App() {
  return (
    <>
      <Navbar />
      <ScrollRestoration getKey={(location) => location.pathname} />
      <Outlet />
    </>
  )
}

export default App
