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
}


module.exports = new RoleService();