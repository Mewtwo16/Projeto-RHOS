import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.service'
import { LoginCredentials } from '../types'
import { useToast } from '../components/ToastContainer'
import '../assets/css/login.css'
import '../assets/css/components.css'
import logoImg from '../assets/img/logo.png'

function Login() {
  const { showError } = useToast()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    usuario: '',
    senha: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiService.login(credentials.usuario, credentials.senha)

      if (response.success && response.token) {
        if (window.api && window.api.notifyLoginSuccess) {
          window.api.notifyLoginSuccess()
        }
        
        setTimeout(() => {
          navigate('/home')
        }, 100)
      } else {
        showError(response.message || 'Erro ao fazer login')
      }
    } catch (err) {
      const error = err as Error
      showError(`Erro na conexão: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container">
      {/* Área de arrastar (drag) */}
      <div className="drag-area" />

      {/* Botão de fechar */}
      <button onClick={() => window.close()} className="close-button">
        ✕
      </button>

        {/* Coluna da Esquerda - Informações */}
        <div className="coluna-info">
          <div className="box-titulo">
            <h1 className="titulo-login">RH-OS</h1>
            <p className="subtitulo-login">Sistema de Gestão de Recursos Humanos</p>
          </div>
          
          <div className="logo-login">
            <img src={logoImg} alt="RH-OS Logo" />
          </div>
          
          <div className="slogan">
            <p>Gestão inteligente para sua empresa</p>
          </div>
        </div>

        {/* Coluna da Direita - Formulário */}
        <div className="formulario">
          <h2 className="texto-login">Bem-vindo</h2>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="input-box">
              <input
                type="text"
                placeholder="Usuário"
                value={credentials.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                required
                disabled={loading}
              />
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Senha"
                value={credentials.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                required
                disabled={loading}
              />
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button
              type="submit"
              className="login"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
    </div>
  )
}

export default Login
