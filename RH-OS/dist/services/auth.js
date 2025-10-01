"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require('knex');
const dotenv = require('dotenv');
dotenv.config();
const knexConfig = require('../knexfile');
const db = knex(knexConfig.development);
async function login(usuario, senha) {
    try {
        const user = await db('usuarios').where({ nome_usuario: usuario }).first();
        if (user && user.senha === senha) {
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
module.exports = {
    login,
    db
};
//# sourceMappingURL=auth.js.map