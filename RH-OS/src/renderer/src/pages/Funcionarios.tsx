import { useState, useEffect } from 'react'
import apiService from '../services/api.service'
import { API_ENDPOINTS } from '../config/api'
import { Employee, EmployeeFormData, Position } from '../types'
import { formatarCPF, limparCPF, formatarMoeda, formatarData, formatarDataParaMySQL } from '../utils/formatters'
import { useToast } from '../components/ToastContainer'
import '../assets/css/global.css'
import '../assets/css/components.css'
import ModalCalculoFolha from '../components/ModalCalculoFolha'

function Funcionarios() {
  const { showError, showSuccess } = useToast()
  const [funcionarios, setFuncionarios] = useState<Employee[]>([])
  const [cargos, setCargos] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('ativo')
  const [modalCalculoAberto, setModalCalculoAberto] = useState(false)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<{
    id: number
    nome: string
  } | null>(null)
  const [showFormCadastro, setShowFormCadastro] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: '',
    cpf: '',
    rg: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    phone: '',
    email: '',
    zip_code: '',
    street: '',
    street_number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    position_id: '',
    hire_date: '',
    current_salary: '',
    transportation_voucher: false,
    meal_voucher: '',
    dependents: '0'
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarFuncionarios()
    carregarCargos()
  }, [filtroStatus])

  const carregarCargos = async () => {
    try {
      const response = await apiService.get<Position[]>(`${API_ENDPOINTS.POSITIONS}?ativo=true`)
      if (response.success) {
        setCargos(response.data || [])
      }
    } catch (error) {
      showError('Erro ao carregar cargos')
    }
  }

  const carregarFuncionarios = async () => {
    try {
      setLoading(true)
      const url = filtroStatus
        ? `${API_ENDPOINTS.EMPLOYEES}?status=${filtroStatus}`
        : API_ENDPOINTS.EMPLOYEES

      const response = await apiService.get<Employee[]>(url)

      if (response.success) {
        setFuncionarios(response.data || [])
      }
    } catch (error) {
      showError('Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ativo: '#28a745',
      ferias: '#ffc107',
      afastado: '#17a2b8',
      demitido: '#dc3545'
    }
    return colors[status] || '#6c757d'
  }

  const abrirModalCalculo = (id: number, nome: string) => {
    setFuncionarioSelecionado({ id, nome })
    setModalCalculoAberto(true)
  }

  const fecharModalCalculo = () => {
    setModalCalculoAberto(false)
    setFuncionarioSelecionado(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev: EmployeeFormData) => ({ ...prev, [name]: checked }))
    } else if (name === 'cpf') {
      setFormData((prev: EmployeeFormData) => ({ ...prev, [name]: limparCPF(value) }))
    } else {
      setFormData((prev: EmployeeFormData) => ({ ...prev, [name]: value }))
    }
  }

  const limparFormulario = () => {
    setFormData({
      full_name: '',
      cpf: '',
      rg: '',
      birth_date: '',
      gender: '',
      marital_status: '',
      phone: '',
      email: '',
      zip_code: '',
      street: '',
      street_number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      position_id: '',
      hire_date: '',
      current_salary: '',
      transportation_voucher: false,
      meal_voucher: '',
      dependents: '0'
    })
  }

  const handleSubmitFuncionario = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hireDateYear = new Date(formData.hire_date).getFullYear()
    const birthDateYear = new Date(formData.birth_date).getFullYear()
    
    if (hireDateYear < 1950 || hireDateYear > 2099) {
      showError('Data de admissão inválida. Por favor, verifique o ano.')
      return
    }
    
    if (birthDateYear < 1900 || birthDateYear > 2010) {
      showError('Data de nascimento inválida. Por favor, verifique o ano.')
      return
    }
    
    setSalvando(true)

    try {
      const dataToSend: Partial<Employee> = {
        full_name: formData.full_name,
        cpf: limparCPF(formData.cpf),
        rg: formData.rg,
        birth_date: formatarDataParaMySQL(formData.birth_date),
        gender: formData.gender,
        marital_status: formData.marital_status,
        phone: formData.phone,
        email: formData.email,
        zip_code: formData.zip_code,
        street: formData.street,
        street_number: formData.street_number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        position_id: parseInt(formData.position_id),
        hire_date: formatarDataParaMySQL(formData.hire_date),
        current_salary: parseFloat(formData.current_salary),
        transportation_voucher: formData.transportation_voucher,
        meal_voucher: formData.meal_voucher ? parseFloat(formData.meal_voucher) : 0,
        dependents: parseInt(formData.dependents) || 0,
        status: 'ativo',
        contract_type: 'CLT'
      }

      const response = await apiService.post(API_ENDPOINTS.EMPLOYEES, dataToSend)

      if (response.success) {
        showSuccess('Funcionário cadastrado com sucesso!')
        limparFormulario()
        setShowFormCadastro(false)
        carregarFuncionarios()
      } else {
        showError(response.message || 'Erro ao cadastrar funcionário')
      }
    } catch (error) {
      const err = error as Error
      showError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setSalvando(false)
    }
  }

  const gerarRelatorioConsolidado = async () => {
    try {
      const url = filtroStatus
        ? `${API_ENDPOINTS.EMPLOYEES}/relatorio/consolidado?status=${filtroStatus}`
        : `${API_ENDPOINTS.EMPLOYEES}/relatorio/consolidado`

      const response = await apiService.get(url)

      if (response.success) {
        const { data, totalizadores } = response.data
        
        let csv = 'Nome,CPF,Cargo,Status,Salário Bruto,INSS,IRRF,Vale Transporte,Total Descontos,Salário Líquido,Encargos Patronais,Custo Total\n'
        
        data.forEach((func: any) => {
          csv += `${func.nome},"${func.cpf}",${func.cargo},${func.status},${func.salario_bruto.toFixed(2)},${func.inss.toFixed(2)},${func.irrf.toFixed(2)},${func.vale_transporte.toFixed(2)},${func.total_descontos.toFixed(2)},${func.salario_liquido.toFixed(2)},${func.encargos_patronais.toFixed(2)},${func.custo_total.toFixed(2)}\n`
        })
        
        csv += '\n'
        csv += `TOTALIZADORES\n`
        csv += `Total de Funcionários,${totalizadores.total_funcionarios}\n`
        csv += `Total Salários Brutos,${totalizadores.total_salarios_brutos.toFixed(2)}\n`
        csv += `Total Descontos,${totalizadores.total_descontos.toFixed(2)}\n`
        csv += `Total Salários Líquidos,${totalizadores.total_salarios_liquidos.toFixed(2)}\n`
        csv += `Total Encargos Patronais,${totalizadores.total_encargos.toFixed(2)}\n`
        csv += `Custo Total Empresa,${totalizadores.custo_total_empresa.toFixed(2)}\n`

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `relatorio_folha_${new Date().getTime()}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      showError('Erro ao gerar relatório consolidado')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <p>Carregando funcionários...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h1 style={{ color: '#2a626a', margin: 0 }}>👥 Gestão de Funcionários</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={gerarRelatorioConsolidado}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📊 Relatório Consolidado
          </button>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              fontSize: '14px'
            }}
          >
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="ferias">Férias</option>
            <option value="afastado">Afastados</option>
            <option value="demitido">Demitidos</option>
          </select>
          <button
            onClick={() => setShowFormCadastro(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2a626a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            + Novo Funcionário
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f7f8fa', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>CPF</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Cargo</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Salário</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Admissão</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  Nenhum funcionário encontrado
                </td>
              </tr>
            ) : (
              funcionarios.map((func) => (
                <tr
                  key={func.id}
                  style={{ borderBottom: '1px solid #e0e0e0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <td style={{ padding: '12px' }}>{func.full_name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {formatarCPF(func.cpf)}
                  </td>
                  <td style={{ padding: '12px' }}>{func.position_name}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                    {formatarMoeda(func.current_salary)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: getStatusColor(func.status),
                        textTransform: 'capitalize'
                      }}
                    >
                      {func.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                    {formatarData(func.hire_date)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#44a0a8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '5px'
                      }}
                      onClick={() => abrirModalCalculo(func.id, func.full_name)}
                    >
                      📊 Calcular
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <strong>Total de funcionários:</strong> {funcionarios.length}
        </div>
        <div>
          <strong>Custo Total (salários):</strong>{' '}
          {formatarMoeda(
            funcionarios.reduce((acc, f) => {
              const salario = typeof f.current_salary === 'number' ? f.current_salary : parseFloat(f.current_salary) || 0
              return acc + salario
            }, 0)
          )}
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Custo total estimado (com encargos):{' '}
          {formatarMoeda(
            funcionarios.reduce((acc, f) => {
              const salario = typeof f.current_salary === 'number' ? f.current_salary : parseFloat(f.current_salary) || 0
              return acc + salario
            }, 0) * 1.383
          )}
        </div>
      </div>

      {modalCalculoAberto && funcionarioSelecionado && (
        <ModalCalculoFolha
          funcionarioId={funcionarioSelecionado.id}
          funcionarioNome={funcionarioSelecionado.nome}
          onClose={fecharModalCalculo}
        />
      )}

      {showFormCadastro && (
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
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => {
            setShowFormCadastro(false)
            limparFormulario()
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, color: '#2a626a', marginBottom: '20px' }}>
              ➕ Novo Funcionário
            </h2>

            <form onSubmit={handleSubmitFuncionario}>
              {/* Dados Pessoais */}
              <h3 style={{ color: '#2a626a', marginTop: '20px', marginBottom: '15px' }}>
                📋 Dados Pessoais
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    RG
                  </label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    min="1900-01-01"
                    max="2010-12-31"
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Sexo
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Estado Civil
                  </label>
                  <select
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecione</option>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Endereço */}
              <h3 style={{ color: '#2a626a', marginTop: '20px', marginBottom: '15px' }}>
                📍 Endereço
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Logradouro
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Número
                  </label>
                  <input
                    type="text"
                    name="street_number"
                    value={formData.street_number}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    maxLength={2}
                    placeholder="UF"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Dados Trabalhistas */}
              <h3 style={{ color: '#2a626a', marginTop: '20px', marginBottom: '15px' }}>
                💼 Dados Trabalhistas
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Cargo *
                  </label>
                  <select
                    name="position_id"
                    value={formData.position_id}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Selecione um cargo</option>
                    {cargos.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.position_name} - {formatarMoeda(cargo.base_salary)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Data de Admissão *
                  </label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    min="1950-01-01"
                    max="2099-12-31"
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Salário Atual *
                  </label>
                  <input
                    type="number"
                    name="current_salary"
                    value={formData.current_salary}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Número de Dependentes
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleInputChange}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Benefícios */}
              <h3 style={{ color: '#2a626a', marginTop: '20px', marginBottom: '15px' }}>
                🎁 Benefícios
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="transportation_voucher"
                      checked={formData.transportation_voucher}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Vale Transporte (6% de desconto)</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Vale Alimentação (R$)
                  </label>
                  <input
                    type="number"
                    name="meal_voucher"
                    value={formData.meal_voucher}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Botões */}
              <div
                style={{
                  marginTop: '30px',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowFormCadastro(false)
                    limparFormulario()
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: salvando ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {salvando ? 'Salvando...' : '💾 Cadastrar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Funcionarios
