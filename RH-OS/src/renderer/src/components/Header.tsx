import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import '../assets/css/Menu.css'
import logoImg from '../assets/img/logo.png'

function Header() {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    
    if (window.api && window.api.notifyLogout) {
      window.api.notifyLogout()
    } else {
      navigate('/login')
    }
  }

  const handleMenuEnter = (menuName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setOpenMenu(menuName)
  }

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null)
    }, 300)
  }

  return (
    <header className="box-header">
      <nav className="box-menu-principal">
        <Link to="/" className="box-imagem">
          <img src={logoImg} alt="RH-OS" />
        </Link>

        <ul className="menu">
          <li 
            className={`dropdown ${openMenu === 'recrutamento' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('recrutamento')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Recrutamento
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Minhas Vagas</a></li>
              <li><a href="#" role="button">Candidatos</a></li>
              <li><a href="#" role="button">Agenda</a></li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'desempenho' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('desempenho')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Desempenho
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Feedback:360</a></li>
              <li><a href="#" role="button">Recrutados</a></li>
              <li><a href="#" role="button">Metas</a></li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'gestao' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('gestao')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Gestão de RH
            </a>
            <ul className="submenus">
              <li>
                <Link to="/funcionarios" role="button">
                  Funcionários
                </Link>
              </li>
              <li>
                <Link to="/cargos-funcionarios" role="button">
                  Cargos
                </Link>
              </li>
              <li><a href="#" role="button">Gestão de férias</a></li>
              <li><a href="#" role="button">Relógio de ponto</a></li>
              <li><a href="#" role="button">Gerenciamento de custos</a></li>
              <li><a href="#" role="button">Desligamento</a></li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'desenvolvimento' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('desenvolvimento')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Desenvolvimento e Satisfação
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Treinamentos</a></li>
              <li><a href="#" role="button">Plano de Carreira</a></li>
              <li><a href="#" role="button">Pesquisa de Satisfação</a></li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'integracao' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('integracao')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Integração
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Não definido</a></li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'relatorios' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('relatorios')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Relatórios
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Contratações</a></li>
              <li><a href="#" role="button">Relatorio de ponto</a></li>
              <li><a href="#" role="button">Custos e pagamentos</a></li>
              <li>
                <Link to="/logs" role="button">
                  Logs de Usuarios
                </Link>
              </li>
            </ul>
          </li>

          <li 
            className={`dropdown ${openMenu === 'sistema' ? 'menu-aberto' : ''}`}
            onMouseEnter={() => handleMenuEnter('sistema')}
            onMouseLeave={handleMenuLeave}
          >
            <a href="#" role="button" aria-haspopup="true">
              Sistema
            </a>
            <ul className="submenus">
              <li><a href="#" role="button">Parametros gerais do sistema</a></li>
              <li>
                <Link to="/usuarios" role="button">
                  Cadastro de Usuarios
                </Link>
              </li>
              <li>
                <Link to="/perfis" role="button">
                  Perfis de Acesso
                </Link>
              </li>
              <li><a href="#" role="button">Documentação</a></li>
              <li><a href="#" role="button">Versão</a></li>
              <li><a href="#" role="button">Licença</a></li>
            </ul>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            backgroundColor: '#e77f67',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Sair
        </button>
      </nav>
    </header>
  )
}

export default Header
