import { useState } from 'react'
import apiService from '../services/api.service'
import { API_ENDPOINTS } from '../config/api'
import { AuditLog } from '../types'
import { formatarDataHora } from '../utils/formatters'
import { hasPermission } from '../utils/auth'
import { useToast } from '../components/ToastContainer'
import '../assets/css/logs.css'
import '../assets/css/components.css'

function Logs() {
  const { showError } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)

    try {
      const response = await apiService.get<AuditLog[]>(API_ENDPOINTS.LOGS)

      if (response.success) {
        setLogs(response.data || [])
      } else {
        showError(response.message || 'Erro ao carregar logs')
      }
    } catch (err) {
      const error = err as Error
      showError(error.message || 'Erro na conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="logs-container">
      {!hasPermission('logs:read') ? (
        <div className="warning-message">
          <h1>Acesso Negado</h1>
          <p>Você não tem permissão para visualizar os logs do sistema.</p>
        </div>
      ) : (
        <div className="logs-content">
          <div className="logs-header">
            <h1>Logs do Sistema</h1>
            <button 
              onClick={fetchLogs}
              disabled={loading}
              className={loading ? 'btn-secondary' : 'btn-primary'}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>

          <div className="card">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <p className="empty-state">
                Clique em "Atualizar" para carregar os logs.
              </p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Quem</th>
                      <th>Onde</th>
                      <th>Quando</th>
                      <th>O que</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.who || `ID: ${log.user_id || 'Sistema'}`}</td>
                        <td className="user-name">{log.where}</td>
                        <td>{formatarDataHora(log.when)}</td>
                        <td>{log.what}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Logs
