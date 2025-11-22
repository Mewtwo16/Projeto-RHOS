import '../assets/css/global.css'
import logoImg from '../assets/img/logo.png'

function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      background: 'transparent'
    }}>
      <img 
        src={logoImg} 
        alt="RH-OS Logo" 
        style={{ 
          maxWidth: '400px', 
          opacity: 0.3,
          marginBottom: '20px'
        }} 
      />
      <h1 style={{ color: '#666', fontSize: '2rem' }}>
        Bem-vindo ao RH-OS
      </h1>
    </div>
  )
}

export default Home
