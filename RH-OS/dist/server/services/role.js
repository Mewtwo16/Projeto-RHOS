"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logService = require('./log');
const db = require('../db/db');
class RoleService {
    async getAllRoles() {
        try {
            const roles = await db('roles').select('*');
            return roles;
        }
        catch (error) {
            console.error('Erro ao buscar cargos:', error);
            throw new Error('Não foi possível buscar os cargos no banco de dados.');
        }
    }
    async addRole(dadosCargo) {
        await db.transaction(async (trx) => {
            await trx('roles').insert({
                role_name: dadosCargo.cargo,
                description: dadosCargo.descricao || null
            });
        });
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
//# sourceMappingURL=role.js.map