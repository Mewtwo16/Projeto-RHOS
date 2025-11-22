import { useEffect, useState } from 'react'
import apiService from '../services/api.service'
import { API_ENDPOINTS } from '../config/api'
import { PayrollCalculation } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { useToast } from './ToastContainer'
import '../assets/css/components.css'

interface Props {
  funcionarioId: number
  funcionarioNome: string
  onClose: () => void
}

function ModalCalculoFolha({ funcionarioId, funcionarioNome, onClose }: Props) {
  const { showError } = useToast()
  const [calculo, setCalculo] = useState<PayrollCalculation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarCalculo()
  }, [funcionarioId])

  const carregarCalculo = async () => {
    try {
      setLoading(true)
      const response = await apiService.get<PayrollCalculation>(
        `${API_ENDPOINTS.EMPLOYEES}/${funcionarioId}/calcular`
      )

      if (response.success) {
        setCalculo(response.data as PayrollCalculation)
      } else {
        showError(response.message || 'Erro ao calcular folha')
      }
    } catch (err) {
      const error = err as Error
      showError(error.message || 'Erro ao carregar cálculo')
    } finally {
      setLoading(false)
    }
  }

  const gerarRecibo = () => {
    if (!calculo) return

    const mes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const dataAtual = new Date().toLocaleDateString('pt-BR')

    const conteudoRecibo = `
═══════════════════════════════════════════════════════
               RECIBO DE PAGAMENTO
═══════════════════════════════════════════════════════

Funcionário: ${funcionarioNome}
Mês/Ano: ${mes}
Data de Emissão: ${dataAtual}

───────────────────────────────────────────────────────
PROVENTOS
───────────────────────────────────────────────────────
Salário Base ......................... ${formatarMoeda(calculo.salarioBruto)}

TOTAL PROVENTOS ...................... ${formatarMoeda(calculo.salarioBruto)}

───────────────────────────────────────────────────────
DESCONTOS
───────────────────────────────────────────────────────
INSS .................................. ${formatarMoeda(calculo.inss)}
IRRF .................................. ${formatarMoeda(calculo.irrf)}
Vale Transporte ....................... ${formatarMoeda(calculo.valeTransporteDesc)}

TOTAL DESCONTOS ...................... ${formatarMoeda(calculo.totalDescontos)}

───────────────────────────────────────────────────────
VALOR LÍQUIDO ........................ ${formatarMoeda(calculo.salarioLiquido)}
═══════════════════════════════════════════════════════

ENCARGOS DA EMPRESA (Informativo)
───────────────────────────────────────────────────────
INSS Patronal (20%) ................... ${formatarMoeda(calculo.inssPatronal)}
FGTS (8%) ............................. ${formatarMoeda(calculo.fgts)}
RAT/FAP (2%) .......................... ${formatarMoeda(calculo.rat)}
Sistema S (5,8%) ...................... ${formatarMoeda(calculo.sistemaS)}
Salário Educação (2,5%) ............... ${formatarMoeda(calculo.salarioEducacao)}

TOTAL ENCARGOS ....................... ${formatarMoeda(calculo.totalEncargos)}

CUSTO TOTAL EMPRESA .................. ${formatarMoeda(calculo.custoTotal)}
═══════════════════════════════════════════════════════
    `.trim()

    const blob = new Blob([conteudoRecibo], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo_${funcionarioNome.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '15px'
          }}
        >
          <h2 style={{ color: '#2a626a', margin: 0 }}>📊 Cálculo de Folha</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>Funcionário:</strong> {funcionarioNome}
        </div>
        <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          <strong>Mês/Ano:</strong>{' '}
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Calculando...
          </div>
        )}

        {calculo && !loading && (
          <>
            <div
              style={{
                backgroundColor: '#f7f8fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', color: '#2a626a', fontSize: '16px' }}>
                PROVENTOS
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Salário Base</span>
                <strong>{formatarMoeda(calculo.salarioBruto)}</strong>
              </div>
              <div
                style={{
                  borderTop: '2px solid #ddd',
                  marginTop: '10px',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <strong>TOTAL PROVENTOS</strong>
                <strong style={{ color: '#28a745' }}>{formatarMoeda(calculo.salarioBruto)}</strong>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fff5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', color: '#e77f67', fontSize: '16px' }}>DESCONTOS</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>INSS</span>
                <span>{formatarMoeda(calculo.inss)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>IRRF</span>
                <span>{formatarMoeda(calculo.irrf)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Vale Transporte</span>
                <span>{formatarMoeda(calculo.valeTransporteDesc)}</span>
              </div>
              <div
                style={{
                  borderTop: '2px solid #ddd',
                  marginTop: '10px',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <strong>TOTAL DESCONTOS</strong>
                <strong style={{ color: '#dc3545' }}>{formatarMoeda(calculo.totalDescontos)}</strong>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#e8f5e9',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#2a626a', fontSize: '18px' }}>SALÁRIO LÍQUIDO</h3>
                <h2 style={{ margin: 0, color: '#28a745', fontSize: '24px' }}>
                  {formatarMoeda(calculo.salarioLiquido)}
                </h2>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f0f7ff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #44a0a8'
              }}
            >
              <h3 style={{ margin: '0 0 15px 0', color: '#2a626a', fontSize: '16px' }}>
                ENCARGOS DA EMPRESA
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>INSS Patronal (20%)</span>
                <span>{formatarMoeda(calculo.inssPatronal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>FGTS (8%)</span>
                <span>{formatarMoeda(calculo.fgts)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>RAT/FAP (2%)</span>
                <span>{formatarMoeda(calculo.rat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Sistema S (5,8%)</span>
                <span>{formatarMoeda(calculo.sistemaS)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span>Salário Educação (2,5%)</span>
                <span>{formatarMoeda(calculo.salarioEducacao)}</span>
              </div>
              <div
                style={{
                  borderTop: '2px solid #44a0a8',
                  marginTop: '10px',
                  paddingTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <strong>TOTAL ENCARGOS</strong>
                <strong style={{ color: '#2a626a' }}>{formatarMoeda(calculo.totalEncargos)}</strong>
              </div>
              <div
                style={{
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '2px solid #44a0a8',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <strong style={{ fontSize: '16px' }}>💰 CUSTO TOTAL EMPRESA</strong>
                <strong style={{ color: '#2a626a', fontSize: '18px' }}>
                  {formatarMoeda(calculo.custoTotal)}
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={gerarRecibo}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#44a0a8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📄 Baixar Recibo
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ModalCalculoFolha
