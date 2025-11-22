import { useState, useEffect } from 'react'
import apiService from '../services/api.service'
import { API_ENDPOINTS } from '../config/api'
import { User, UserFormData, Profile } from '../types'
import { formatarCPF, limparCPF, formatarDataParaMySQL } from '../utils/formatters'
import { hasPermission } from '../utils/auth'
import { useToast } from '../components/ToastContainer'
import '../assets/css/user.css'
import '../assets/css/components.css'

function Usuarios() {
  const { showSuccess, showError } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    user: '',
    password: '',
    cpf: '',
    role: '',
    status: 1,
    birth_date: '1990-01-01'
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await apiService.get<User[]>(API_ENDPOINTS.USERS)
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (err) {
      showError('Erro ao carregar usuários')
    }
  }

  const loadRoles = async () => {
    try {
      const response = await apiService.get<Profile[]>(API_ENDPOINTS.PROFILES)
      if (response.success) {
        setRoles(response.data || [])
      }
    } catch (err) {
      showError('Erro ao carregar perfis')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let finalValue: string | number = value
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked ? 1 : 0
    } else if (name === 'cpf') {
      finalValue = limparCPF(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend: UserFormData = {
        full_name: formData.full_name,
        email: formData.email,
        user: formData.user,
        cpf: formData.cpf,
        role: formData.role,
        status: formData.status,
        birth_date: formatarDataParaMySQL(formData.birth_date || '1990-01-01')
      }

      if (formData.password) {
        dataToSend.password = formData.password
      }

      let response
      if (editingUser) {
        response = await apiService.put(API_ENDPOINTS.USER_BY_ID(editingUser.id), dataToSend)
      } else {
        if (!formData.password) {
          showError('Senha é obrigatória para novo usuário')
          setLoading(false)
          return
        }
        dataToSend.password = formData.password
        response = await apiService.post(API_ENDPOINTS.USERS, dataToSend)
      }

      if (response.success) {
        showSuccess(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!')
        setShowForm(false)
        resetForm()
        loadUsers()
      } else {
        showError(response.message || `Erro ao ${editingUser ? 'atualizar' : 'cadastrar'} usuário`)
      }
    } catch (err) {
      const error = err as Error
      showError(error.message || 'Erro na conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      user: '',
      password: '',
      cpf: '',
      role: '',
      status: 1,
      birth_date: '1990-01-01'
    })
    setEditingUser(null)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      user: user.login,
      password: '',
      cpf: user.cpf,
      role: user.role || '',
      status: user.status,
      birth_date: user.birth_date || '1990-01-01'
    })
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    resetForm()
  }

  return (
    <div className="usuarios-container">
      <div className="usuarios-content">
        <div className="usuarios-header">
          <h1>Gerenciamento de Usuários</h1>
          {hasPermission('users:create') && (
            <button 
              onClick={() => {
                if (showForm) {
                  handleCancelEdit()
                } else {
                  setShowForm(true)
                }
              }}
              className={showForm ? 'btn-danger' : 'btn-primary'}
            >
              {showForm ? 'Cancelar' : 'Novo Usuário'}
            </button>
          )}
        </div>

        {!hasPermission('users:view') && !hasPermission('users:read') ? (
          <div className="warning-message">
            ⚠️ Você não tem permissão para visualizar usuários.
          </div>
        ) : (
          <>
            {showForm && (
              <div className="card">
                <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Login *</label>
                  <input
                    type="text"
                    name="user"
                    value={formData.user}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser}
                  />
                  {editingUser && (
                    <small>O login não pode ser alterado</small>
                  )}
                </div>

                <div className="form-field">
                  <label>Senha {editingUser ? '(deixe vazio para não alterar)' : '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                  />
                </div>

                <div className="form-field">
                  <label>CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formatarCPF(formData.cpf)}
                    onChange={handleInputChange}
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div className="form-field">
                  <label>Perfil de Acesso *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um perfil</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.profile_name}>
                        {role.profile_name}
                      </option>
                    ))}
                  </select>
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
                      name="status"
                      checked={formData.status === 1}
                      onChange={handleInputChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginRight: '10px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontWeight: 'bold' }}>
                      Usuário Ativo
                    </span>
                    <span style={{ 
                      marginLeft: '10px', 
                      fontSize: '12px', 
                      color: formData.status === 1 ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {formData.status === 1 ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="usuarios-list">
          <h2>Lista de Usuários</h2>
          {users.length === 0 ? (
            <p className="empty-state">
              Nenhum usuário cadastrado.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Login</th>
                    <th>CPF</th>
                    <th>Perfil</th>
                    <th className="center">Status</th>
                    <th className="center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td className="user-name">
                        {user.full_name}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.login}</td>
                      <td>{formatarCPF(user.cpf)}</td>
                      <td>
                        <span className="badge-info">
                          {user.role || 'Sem perfil'}
                        </span>
                      </td>
                      <td className="center">
                        <span className={user.status === 1 ? 'badge-success' : 'badge-danger'}>
                          {user.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="center">
                        {hasPermission('users:update') && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn-sm btn-primary"
                          >
                            Editar
                          </button>
                        )}
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
    </div>
  )
}

export default Usuarios
