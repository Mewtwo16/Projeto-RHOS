const bcrypt = require('bcrypt');
import type { Knex } from 'knex';
const db = require('../db/db') as Knex;
const logService = require('./log');

class UserService {
    async addUser(dadosUsuario: any) {
        const saltRounds = 10;

        const senhaHash = await bcrypt.hash(dadosUsuario.senha, saltRounds);

        await db.transaction(async (trx) => {
            const [novoUsuarioId] = await trx('users').insert({
                full_name: dadosUsuario.nome_completo ?? dadosUsuario.nome,
                email: dadosUsuario.email,
                cpf: dadosUsuario.cpf,
                birth_date: dadosUsuario.dataNascimento,
                login: dadosUsuario.usuario,
                password_hash: senhaHash,
                status: 1,
                creation_date: new Date()
            });

            const role = await trx('roles').where({ role_name: dadosUsuario.cargo }).first();
            
            if (!role) {
                throw new Error(`O cargo '${dadosUsuario.cargo}' não foi encontrado.`);
            }

            await trx('role_users').insert({
                users_id: novoUsuarioId,
                roles_id: role.id
            });
            try {
                await logService.writeLogs({
                user_id: novoUsuarioId,
                username: dadosUsuario.usuario,
                action: 'create',
                resource: 'users',
                resource_id: novoUsuarioId,
                details: `Criado usuário ${dadosUsuario.usuario} com role ${dadosUsuario.cargo}`
            }, trx);
            } catch (error) {
                console.error('Erro ao gravar log de criação de usuário:', error);
            }
        });
    }
}





module.exports = new UserService();