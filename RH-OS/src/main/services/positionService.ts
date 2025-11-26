import db from '../db/db'

interface Position {
  id?: number
  position_name: string
  description?: string
  base_salary: number
  weekly_hours?: number
  level?: string
  department?: string
  active?: boolean
}

class PositionService {
  async listPositions(onlyActive: boolean = true): Promise<Position[]> {
    const query = db('positions').orderBy('position_name')
    
    if (onlyActive) {
      query.where('active', 1)
    }
    
    return await query
  }

  async findPositionById(id: number): Promise<Position | null> {
    const position = await db('positions')
      .where('id', id)
      .first()
    
    return position || null
  }

  async createPosition(position: Position): Promise<number> {
    const [id] = await db('positions').insert({
      position_name: position.position_name,
      description: position.description || null,
      base_salary: position.base_salary,
      weekly_hours: position.weekly_hours || 44,
      level: position.level || null,
      department: position.department || null,
      active: position.active !== false ? 1 : 0
    })
    
    return id
  }

  async updatePosition(id: number, position: Partial<Position>): Promise<boolean> {
    const updateData: any = {}

    if (position.position_name !== undefined) updateData.position_name = position.position_name
    if (position.description !== undefined) updateData.description = position.description
    if (position.base_salary !== undefined) updateData.base_salary = position.base_salary
    if (position.weekly_hours !== undefined) updateData.weekly_hours = position.weekly_hours
    if (position.level !== undefined) updateData.level = position.level
    if (position.department !== undefined) updateData.department = position.department
    if (position.active !== undefined) updateData.active = position.active ? 1 : 0

    if (Object.keys(updateData).length === 0) {
      return false
    }

    const result = await db('positions')
      .where('id', id)
      .update(updateData)
    
    return result > 0
  }

  async deletePosition(id: number): Promise<boolean> {
    const result = await db('positions')
      .where('id', id)
      .update({ active: 0 })
    
    return result > 0
  }

  async isPositionInUse(id: number): Promise<boolean> {
    const count = await db('employees')
      .where('position_id', id)
      .where('status', 'ativo')
      .count('* as count')
      .first()
    
    return (count?.count as number) > 0
  }
}

export default new PositionService()
