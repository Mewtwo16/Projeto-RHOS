import { Outlet } from 'react-router-dom'
import Header from './Header'
import '../assets/css/Menu.css'
import '../assets/css/global.css'

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <main className="conteudo-principal">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
