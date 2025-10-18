"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const db = require('../db/db');
const logService = require('./log');
async function adicionarUsuario(dbParam, dadosUsuario) {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(dadosUsuario.senha, saltRounds);
    await db.transaction(async (trx) => {
        const [novoUsuarioId] = await trx('usuarios').insert({
            nome_completo: dadosUsuario.nome_completo,
            email: dadosUsuario.email,
            cpf: dadosUsuario.cpf,
            DataNascimento: dadosUsuario.dataNascimento,
            login: dadosUsuario.usuario,
            senha_hash: senhaHash,
            status: 1,
            data_criacao: new Date()
        });
        const role = await trx('roles').where({ nome_role: dadosUsuario.cargo }).first();
        if (!role) {
            throw new Error(`O cargo '${dadosUsuario.cargo}' não foi encontrado.`);
        }
        await trx('role_usuario').insert({
            user_id: novoUsuarioId,
            roles_id: role.id
        });
        try {
            await logService.registrar({
                user_id: novoUsuarioId,
                username: dadosUsuario.usuario,
                action: 'create',
                resource: 'usuarios',
                resource_id: novoUsuarioId,
                details: `Criado usuário ${dadosUsuario.usuario} com role ${dadosUsuario.cargo}`
            }, trx);
        }
        catch (err) {
            console.error('Erro ao gravar log de criação de usuário:', err);
        }
    });
}
module.exports = {
    adicionarUsuario: async (dadosUsuario) => adicionarUsuario(db, dadosUsuario)
};
//# sourceMappingURL=user.js.map