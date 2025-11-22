import db from '../db/db'
import type { AllowedPermission } from '../types'

class AllowedService {
  async listAll(): Promise<{ success: boolean; data?: AllowedPermission[]; message?: string }> {
    try {
      const rows = await db<AllowedPermission>('allowed')
        .select('id', 'permission_name')
        .orderBy('permission_name', 'asc')
      return { success: true, data: rows }
    } catch (error) {
      return {
        success: false,
        message: `[AllowedService ERROR] Falha ao listar permissões: ${error}`
      }
    }
  }
}

export default new AllowedService()
