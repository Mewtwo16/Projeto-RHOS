"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const db = require('../db/db');
const knexConfig = require('../knexfile');
async function login(usuario, senha) {
    try {
        const user = await db('usuarios').where({ login: usuario }).first();
        if (user && await bcrypt.compare(senha, user.senha_hash)) {
            return { success: true, message: 'Login bem-sucedido!' };
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
;
module.exports = { login };
//# sourceMappingURL=auth.js.map