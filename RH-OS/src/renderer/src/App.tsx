import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastProvider } from './components/ToastContainer'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Usuarios from './pages/Usuarios'
import Perfis from './pages/Perfils'
import CargosFunc from './pages/Cargos'
import Logs from './pages/Logs'
import Funcionarios from './pages/Funcionarios'
import './assets/css/global.css'

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setInitialRoute(token ? '/home' : '/login')
  }, [])

  if (initialRoute === null) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="home" element={<Home />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="perfis" element={<Perfis />} />
            <Route path="cargos-funcionarios" element={<CargosFunc />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="logs" element={<Logs />} />
          </Route>
          <Route index element={<Navigate to={initialRoute} replace />} />
          <Route path="*" element={<Navigate to={initialRoute} replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
