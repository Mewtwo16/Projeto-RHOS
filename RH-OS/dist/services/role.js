"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
}
module.exports = new RoleService();
//# sourceMappingURL=role.js.map