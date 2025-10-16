"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
async function adicionarUsuario(db, dadosUsuario) {
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
    });
}
module.exports = {
    adicionarUsuario
};
//# sourceMappingURL=user.js.map