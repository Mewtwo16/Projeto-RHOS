import type { Knex } from 'knex';

const db = require('../db/db') as Knex;

interface Role {
    id: number;
    nome_role: string;
    descricao?: string;
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

}

module.exports = new RoleService();