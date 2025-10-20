"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const db = require('../db/db');
class AuthService {
    async login(usuario, senha) {
        try {
            const user = await db('users').where({ login: usuario }).first();
            if (user && user.status === 1 && await bcrypt.compare(senha, user.password_hash)) {
                return { success: true, message: 'Login bem-sucedido!', userId: user.id };
            }
            else {
                return { success: false, message: 'Usuário ou senha inválidos' };
            }
        }
        catch (error) {
            console.error('[Main IPC Error]:', error);
            return { success: false, message: 'Erro de comunicação com o servidor.' };
        }
    }
}
module.exports = new AuthService;
//# sourceMappingURL=auth.js.map