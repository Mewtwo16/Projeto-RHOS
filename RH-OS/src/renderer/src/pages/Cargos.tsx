import { useState, useEffect } from 'react'
import apiService from '../services/api.service'
import { API_ENDPOINTS } from '../config/api'
import { Position, PositionFormData } from '../types'
import { formatarMoeda } from '../utils/formatters'
import { hasPermission } from '../utils/auth'
import { useToast } from '../components/ToastContainer'
import ConfirmModal from '../components/ConfirmModal'
import '../assets/css/components.css'

function CargosFunc() {
  const { showSuccess, showError } = useToast()
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; positionId: number | null }>({
    isOpen: false,
    positionId: null
  })
  const [formData, setFormData] = useState<PositionFormData>({
    position_name: '',
    description: '',
    base_salary: '',
    weekly_hours: '44',
    level: '',
    department: '',
    active: true
  })

  useEffect(() => {
    loadPositions()
  }, [])

  const loadPositions = async () => {
    try {
      const response = await apiService.get<Position[]>(`${API_ENDPOINTS.POSITIONS}?actives=false`)
      if (response.success) {
        setPositions(response.data || [])
      }
    } catch (err) {
      showError('Erro ao carregar cargos')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData((prev: PositionFormData) => ({
      ...prev,
      [name]: finalValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend: Partial<Position> = {
        position_name: formData.position_name,
        description: formData.description || '',
        base_salary: parseFloat(formData.base_salary),
        weekly_hours: parseInt(formData.weekly_hours),
        level: formData.level || '',
        department: formData.department || '',
        active: formData.active
      }
      
      let response
      if (editingPosition) {
        response = await apiService.put(API_ENDPOINTS.POSITION_BY_ID(editingPosition.id), dataToSend)
      } else {
        response = await apiService.post(API_ENDPOINTS.POSITIONS, dataToSend)
      }

      if (response.success) {
        showSuccess(editingPosition ? 'Cargo atualizado com sucesso!' : 'Cargo cadastrado com sucesso!')
        setShowForm(false)
        resetForm()
        loadPositions()
      } else {
        showError(response.message || 'Erro ao salvar cargo')
      }
    } catch (err) {
      const error = err as Error
      showError(error.message || 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      position_name: '',
      description: '',
      base_salary: '',
      weekly_hours: '44',
      level: '',
      department: '',
      active: true
    })
    setEditingPosition(null)
  }

  const handleEdit = (position: Position) => {
    setEditingPosition(position)
    setFormData({
      position_name: position.position_name,
      description: position.description || '',
      base_salary: position.base_salary.toString(),
      weekly_hours: position.weekly_hours.toString(),
      level: position.level || '',
      department: position.department || '',
      active: position.active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    setConfirmDelete({ isOpen: true, positionId: id })
  }

  const confirmDeletePosition = async () => {
    if (!confirmDelete.positionId) return

    try {
      const response = await apiService.put(
        API_ENDPOINTS.POSITION_BY_ID(confirmDelete.positionId),
        { active: false }
      )

      if (response.success) {
        showSuccess('Cargo inativado com sucesso!')
        loadPositions()
      } else {
        showError(response.message || 'Erro ao inativar cargo')
      }
    } catch (err) {
      showError('Erro ao inativar cargo')
    } finally {
      setConfirmDelete({ isOpen: false, positionId: null })
    }
  }

  const handleActivate = async (id: number) => {
    try {
      const response = await apiService.put(API_ENDPOINTS.POSITION_BY_ID(id), { active: true })

      if (response.success) {
        showSuccess('Cargo ativado com sucesso!')
        loadPositions()
      } else {
        showError(response.message || 'Erro ao ativar cargo')
      }
    } catch (err) {
      showError('Erro ao ativar cargo')
    }
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    resetForm()
  }

  const formatarMoedaLocal = (valor: number) => {
    return formatarMoeda(valor)
  }

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: '#fafbfc',
      overflow: 'auto'
    }}>
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0 }}>Cargos de Funcionários</h1>
          {hasPermission('positions:create') && (
            <button 
              onClick={() => {
                if (showForm) {
                  handleCancelEdit()
                } else {
                  setShowForm(true)
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: showForm ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showForm ? 'Cancelar' : 'Novo Cargo'}
            </button>
          )}
        </div>

        {!hasPermission('positions:view') ? (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ffeeba'
          }}>
            ⚠️ Você não tem permissão para visualizar cargos.
          </div>
        ) : (
          <>
            {showForm && (
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h2>{editingPosition ? 'Editar Cargo' : 'Novo Cargo'}</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Nome do Cargo *
                      </label>
                      <input
                        type="text"
                        name="position_name"
                        value={formData.position_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: Analista de Sistemas"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Salário Base *
                      </label>
                      <input
                        type="number"
                        name="base_salary"
                        value={formData.base_salary}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="Ex: 3500.00"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Carga Horária Semanal *
                      </label>
                      <input
                        type="number"
                        name="weekly_hours"
                        value={formData.weekly_hours}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="44"
                        placeholder="Ex: 44"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Nível
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      >
                        <option value="">Selecione um nível</option>
                        <option value="Estagiário">Estagiário</option>
                        <option value="Júnior">Júnior</option>
                        <option value="Pleno">Pleno</option>
                        <option value="Sênior">Sênior</option>
                        <option value="Especialista">Especialista</option>
                        <option value="Coordenador">Coordenador</option>
                        <option value="Gerente">Gerente</option>
                        <option value="Diretor">Diretor</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Departamento
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Ex: Tecnologia da Informação"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Descrição
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Descrição detalhada do cargo e suas responsabilidades"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        <input
                          type="checkbox"
                          name="active"
                          checked={formData.active}
                          onChange={handleInputChange}
                          style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '10px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontWeight: 'bold' }}>
                          Cargo Ativo
                        </span>
                        <span style={{ 
                          marginLeft: '10px', 
                          fontSize: '12px', 
                          color: formData.active ? '#4CAF50' : '#f44336',
                          fontWeight: 'bold'
                        }}>
                          {formData.active ? '✓ Ativo' : '✗ Inativo'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '10px 30px',
                        backgroundColor: loading ? '#ccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2>Lista de Cargos</h2>
              {positions.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Nenhum cargo cadastrado.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '10px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nome</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Departamento</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nível</th>
                        <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Salário Base</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Carga Horária</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map(position => (
                        <tr key={position.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            <strong>{position.position_name}</strong>
                            {position.description && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                {position.description.length > 50 
                                  ? position.description.substring(0, 50) + '...' 
                                  : position.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>{position.department || '-'}</td>
                          <td style={{ padding: '12px' }}>{position.level || '-'}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                            {formatarMoedaLocal(position.base_salary)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {position.weekly_hours}h/sem
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              backgroundColor: position.active ? '#e8f5e9' : '#ffebee',
                              color: position.active ? '#2e7d32' : '#c62828'
                            }}>
                              {position.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {hasPermission('positions:update') && (
                              <button
                                onClick={() => handleEdit(position)}
                                style={{
                                  padding: '5px 10px',
                                  marginRight: '8px',
                                  backgroundColor: '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Editar
                              </button>
                            )}
                            {hasPermission('positions:delete') && position.active ? (
                              <button
                                onClick={() => handleDelete(position.id)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Inativar
                              </button>
                            ) : null}
                            {hasPermission('positions:update') && !position.active ? (
                              <button
                                onClick={() => handleActivate(position.id)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                Reativar
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Confirmar Inativação"
        message="Tem certeza que deseja inativar este cargo? Esta ação pode ser revertida posteriormente."
        confirmText="Inativar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDeletePosition}
        onCancel={() => setConfirmDelete({ isOpen: false, positionId: null })}
      />
    </div>
  )
}

export default CargosFunc
