import db from '../db/db'

interface CargoCLT {
  id?: number
  position_name: string
  description?: string
  base_salary: number
  weekly_hours?: number
  level?: string
  department?: string
  active?: boolean
}

class CargoService {
  async listarCargos(apenasAtivos: boolean = true): Promise<CargoCLT[]> {
    const query = db('positions').orderBy('position_name')
    
    if (apenasAtivos) {
      query.where('active', 1)
    }
    
    return await query
  }

  async buscarCargoPorId(id: number): Promise<CargoCLT | null> {
    const cargo = await db('positions')
      .where('id', id)
      .first()
    
    return cargo || null
  }

  async criarCargo(cargo: CargoCLT): Promise<number> {
    const [id] = await db('positions').insert({
      position_name: cargo.position_name,
      description: cargo.description || null,
      base_salary: cargo.base_salary,
      weekly_hours: cargo.weekly_hours || 44,
      level: cargo.level || null,
      department: cargo.department || null,
      active: cargo.active !== false ? 1 : 0
    })
    
    return id
  }

  async atualizarCargo(id: number, cargo: Partial<CargoCLT>): Promise<boolean> {
    const dadosAtualizacao: any = {}

    if (cargo.position_name !== undefined) dadosAtualizacao.position_name = cargo.position_name
    if (cargo.description !== undefined) dadosAtualizacao.description = cargo.description
    if (cargo.base_salary !== undefined) dadosAtualizacao.base_salary = cargo.base_salary
    if (cargo.weekly_hours !== undefined) dadosAtualizacao.weekly_hours = cargo.weekly_hours
    if (cargo.level !== undefined) dadosAtualizacao.level = cargo.level
    if (cargo.department !== undefined) dadosAtualizacao.department = cargo.department
    if (cargo.active !== undefined) dadosAtualizacao.active = cargo.active ? 1 : 0

    if (Object.keys(dadosAtualizacao).length === 0) {
      return false
    }

    const result = await db('positions')
      .where('id', id)
      .update(dadosAtualizacao)
    
    return result > 0
  }

  async deletarCargo(id: number): Promise<boolean> {
    const result = await db('positions')
      .where('id', id)
      .update({ active: 0 })
    
    return result > 0
  }

  async cargoEmUso(id: number): Promise<boolean> {
    const count = await db('employees')
      .where('position_id', id)
      .where('status', 'ativo')
      .count('* as count')
      .first()
    
    return (count?.count as number) > 0
  }
}

export default new CargoService()
