import db from '../db/db'

interface Funcionario {
  id?: number
  full_name: string
  cpf: string
  rg?: string
  birth_date: string
  gender?: string
  marital_status?: string
  nationality?: string
  phone?: string
  email?: string
  zip_code?: string
  street?: string
  street_number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  position_id: number
  hire_date: string
  termination_date?: string
  status?: string
  contract_type?: string
  bank?: string
  agency?: string
  account?: string
  account_type?: string
  current_salary: number
  transportation_voucher?: boolean
  meal_voucher?: number
  health_insurance?: boolean
  dental_insurance?: boolean
  dependents?: number
  ctps_numero?: string
  ctps_serie?: string
  ctps_uf?: string
  pis_pasep?: string
  titulo_eleitor?: string
  notes?: string
}

interface CalculoFolha {
  salarioBruto: number
  inss: number
  irrf: number
  valeTransporteDesc: number
  totalDescontos: number
  salarioLiquido: number
  fgts: number
  inssPatronal: number
  rat: number
  sistemaS: number
  salarioEducacao: number
  totalEncargos: number
  custoTotal: number
}

class FuncionarioService {
  async listarFuncionarios(status?: string): Promise<any[]> {
    let query = db('employees as f')
      .leftJoin('positions as c', 'f.position_id', 'c.id')
      .select(
        'f.*',
        'c.position_name',
        'c.level',
        'c.department'
      )
      .orderBy('f.full_name')

    if (status) {
      query = query.where('f.status', status)
    }

    return await query
  }

  async buscarFuncionarioPorId(id: number): Promise<any | null> {
    const funcionario = await db('employees as f')
      .leftJoin('positions as c', 'f.position_id', 'c.id')
      .select(
        'f.*',
        'c.position_name',
        'c.level',
        'c.department',
        'c.base_salary'
      )
      .where('f.id', id)
      .first()

    return funcionario || null
  }

  async buscarFuncionarioPorCPF(cpf: string): Promise<Funcionario | null> {
    const funcionario = await db('employees')
      .where('cpf', cpf)
      .first()

    return funcionario || null
  }

  async criarFuncionario(funcionario: Funcionario): Promise<number> {
    const [id] = await db('employees').insert({
      full_name: funcionario.full_name,
      cpf: funcionario.cpf,
      rg: funcionario.rg || null,
      birth_date: funcionario.birth_date,
      gender: funcionario.gender || null,
      marital_status: funcionario.marital_status || null,
      nationality: funcionario.nationality || 'Brasileiro',
      phone: funcionario.phone || null,
      email: funcionario.email || null,
      zip_code: funcionario.zip_code || null,
      street: funcionario.street || null,
      street_number: funcionario.street_number || null,
      complement: funcionario.complement || null,
      neighborhood: funcionario.neighborhood || null,
      city: funcionario.city || null,
      state: funcionario.state || null,
      position_id: funcionario.position_id,
      hire_date: funcionario.hire_date,
      termination_date: funcionario.termination_date || null,
      status: funcionario.status || 'ativo',
      contract_type: funcionario.contract_type || 'CLT',
      bank: funcionario.bank || null,
      agency: funcionario.agency || null,
      account: funcionario.account || null,
      account_type: funcionario.account_type || null,
      current_salary: funcionario.current_salary,
      transportation_voucher: funcionario.transportation_voucher ? 1 : 0,
      meal_voucher: funcionario.meal_voucher || 0,
      health_insurance: funcionario.health_insurance ? 1 : 0,
      dental_insurance: funcionario.dental_insurance ? 1 : 0,
      dependents: funcionario.dependents || 0,
      ctps_numero: funcionario.ctps_numero || null,
      ctps_serie: funcionario.ctps_serie || null,
      ctps_uf: funcionario.ctps_uf || null,
      pis_pasep: funcionario.pis_pasep || null,
      titulo_eleitor: funcionario.titulo_eleitor || null,
      notes: funcionario.notes || null
    })

    return id
  }

  async atualizarFuncionario(id: number, funcionario: Partial<Funcionario>): Promise<boolean> {
    const dadosAtualizacao: any = {}

    Object.keys(funcionario).forEach((key) => {
      const typedKey = key as keyof Funcionario
      if (funcionario[typedKey] !== undefined) {
        dadosAtualizacao[key] = funcionario[typedKey]
      }
    })

    if (Object.keys(dadosAtualizacao).length === 0) {
      return false
    }

    const result = await db('employees')
      .where('id', id)
      .update(dadosAtualizacao)

    return result > 0
  }

  async inativarFuncionario(id: number, dataDesligamento: string): Promise<boolean> {
    const result = await db('employees')
      .where('id', id)
      .update({
        status: 'demitido',
        termination_date: dataDesligamento
      })

    return result > 0
  }

  private calcularINSS(salarioBruto: number): number {
    // Tabela INSS 2024/2025 - Progressiva
    const faixas = [
      { limite: 1412.00, aliquota: 0.075, limiteAnterior: 0 },        // 7,5%
      { limite: 2666.68, aliquota: 0.09, limiteAnterior: 1412.00 },   // 9%
      { limite: 4000.03, aliquota: 0.12, limiteAnterior: 2666.68 },   // 12%
      { limite: 7786.02, aliquota: 0.14, limiteAnterior: 4000.03 }    // 14%
    ]

    let inss = 0
    let salarioRestante = salarioBruto

    for (const faixa of faixas) {
      if (salarioRestante <= 0) break

      const baseCalculo = Math.min(salarioRestante, faixa.limite - faixa.limiteAnterior)
      inss += baseCalculo * faixa.aliquota
      salarioRestante -= baseCalculo
    }

    // Teto máximo de contribuição INSS 2024/2025
    return Math.min(inss, 908.86)
  }

  private calcularIRRF(salarioBruto: number, inss: number, dependents: number): number {
    // Dedução por dependente - Tabela IRRF 2024/2025
    const deducaoPorDependente = 189.59
    const baseCalculo = salarioBruto - inss - (deducaoPorDependente * dependents)

    // Tabela progressiva IRRF 2024/2025
    if (baseCalculo <= 2259.20) return 0                                      // Isento
    if (baseCalculo <= 2826.65) return Math.max(0, baseCalculo * 0.075 - 169.44)   // 7,5%
    if (baseCalculo <= 3751.05) return Math.max(0, baseCalculo * 0.15 - 381.44)    // 15%
    if (baseCalculo <= 4664.68) return Math.max(0, baseCalculo * 0.225 - 662.77)   // 22,5%
    return Math.max(0, baseCalculo * 0.275 - 896.00)                                // 27,5%
  }

  private calcularEncargosPatronais(salarioBruto: number): any {
    // Encargos Patronais conforme Legislação Brasileira 2024/2025
    const inssPatronal = salarioBruto * 0.20      // INSS Patronal: 20%
    const rat = salarioBruto * 0.02               // RAT (Risco Ambiental do Trabalho): 1% a 3% - usando 2% (médio)
    const sistemaS = salarioBruto * 0.058         // Sistema S (SESI, SENAI, etc): 5,8% (média)
    const salarioEducacao = salarioBruto * 0.025  // Salário Educação: 2,5%
    const fgts = salarioBruto * 0.08              // FGTS: 8%
    
    const total = inssPatronal + rat + sistemaS + salarioEducacao + fgts

    return {
      inssPatronal,
      rat,
      sistemaS,
      salarioEducacao,
      fgts,
      total  // Total: 38,3%
    }
  }

  async calcularFolhaPagamento(idFuncionario: number): Promise<CalculoFolha> {
    const funcionario = await this.buscarFuncionarioPorId(idFuncionario)

    if (!funcionario) {
      throw new Error('Funcionário não encontrado')
    }

    const salarioBruto = Number(funcionario.current_salary) || 0
    const inss = this.calcularINSS(salarioBruto)
    const dependentes = Number(funcionario.dependents) || 0
    const irrf = this.calcularIRRF(salarioBruto, inss, dependentes)

    // Vale Transporte: desconto limitado a 6% do salário base
    let valeTransporteDesc = 0
    if (funcionario.transportation_voucher) {
      valeTransporteDesc = salarioBruto * 0.06
    }

    const totalDescontos = inss + irrf + valeTransporteDesc
    const salarioLiquido = salarioBruto - totalDescontos

    const encargos = this.calcularEncargosPatronais(salarioBruto)

    const beneficiosEmpresa = Number(funcionario.meal_voucher) || 0

    const custoTotal = salarioBruto + encargos.total + beneficiosEmpresa

    return {
      salarioBruto,
      inss,
      irrf,
      valeTransporteDesc,
      totalDescontos,
      salarioLiquido,
      fgts: encargos.fgts,
      inssPatronal: encargos.inssPatronal,
      rat: encargos.rat,
      sistemaS: encargos.sistemaS,
      salarioEducacao: encargos.salarioEducacao,
      totalEncargos: encargos.total,
      custoTotal
    }
  }

  async obterEstatisticas(): Promise<any> {
    const totalAtivos = await db('employees')
      .where('status', 'ativo')
      .count('* as count')
      .first()

    const totalFuncionarios = await db('employees')
      .count('* as count')
      .first()

    const custoTotal = await db('employees')
      .where('status', 'ativo')
      .sum('current_salary as total')
      .first()

    return {
      totalAtivos: totalAtivos?.count || 0,
      totalFuncionarios: totalFuncionarios?.count || 0,
      custoSalarios: custoTotal?.total || 0,
      custoTotalEstimado: (custoTotal?.total || 0) * 1.383 // Incluindo encargos médios
    }
  }
}

export default new FuncionarioService()
