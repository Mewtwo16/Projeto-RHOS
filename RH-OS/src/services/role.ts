import type { Knex } from 'knex';
const logService = require('./log');
const db = require('../db/db') as Knex;

interface Role {
    id: number;
    role_name: string;
    description?: string;
}

class RoleService {
    async getAllRoles(): Promise<Role[]> {
        try {
            const roles = await db<Role>('roles').select('*');
            return roles;
        } catch (error) {
            console.error('Erro ao buscar cargos:', error);
            throw new Error('Não foi possível buscar os cargos no banco de dados.');
        }
    }

    async addRole(dadosCargo: any){
        await db.transaction(async (trx) => {
            await trx('roles').insert({
                role_name: dadosCargo.cargo,
                description: dadosCargo.descricao || null
            })
        })
        await logService.writeLogs({
            user_id: null,
            username: null,
            action: 'create',
            resource: 'roles',
            resource_id: null,
            details: `Criado cargo ${dadosCargo.role_name}`
        });
    }

    async searchRoles(filters?: { field?: string; value?: string }): Promise<Role[]> {
        const q = db<Role>('roles').select('*').orderBy('role_name', 'asc');
        if (filters && filters.field && typeof filters.value === 'string' && filters.value.length > 0) {
            const val = `%${filters.value}%`;
            if (filters.field === 'role_name') q.where('role_name', 'like', val);
            else if (filters.field === 'description') q.where('description', 'like', val);
        }
        return q;
    }
}


module.exports = new RoleService();