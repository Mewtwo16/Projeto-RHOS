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

    async searchUsers(filters?: { field?: string; value?: string }) {
        const q = db('users as u')
            .leftJoin('role_users as ru', 'ru.users_id', 'u.id')
            .leftJoin('roles as r', 'r.id', 'ru.roles_id')
            .select(
                'u.id',
                'u.full_name',
                'u.email',
                'u.login',
                'u.cpf',
                'u.birth_date',
                'u.status',
                db.raw('COALESCE(r.role_name, ?) as role', [''])
            )
            .orderBy('u.full_name', 'asc');

        if (filters && filters.field && typeof filters.value === 'string' && filters.value.length > 0) {
            const val = `%${filters.value}%`;
            switch (filters.field) {
                case 'full_name':
                    q.where('u.full_name', 'like', val);
                    break;
                case 'email':
                    q.where('u.email', 'like', val);
                    break;
                case 'login':
                    q.where('u.login', 'like', val);
                    break;
                case 'cpf':
                    q.where('u.cpf', 'like', filters.value.replace(/\D+/g, '') + '%');
                    break;
                case 'role':
                    q.where('r.role_name', 'like', val);
                    break;
                default:
                    break;
            }
        }

        const rows = await q;
        return rows.map((u: any) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            login: u.login,
            cpf: u.cpf,
            birth_date: u.birth_date,
            status: u.status,
            role: u.role,
        }));
    }
}

module.exports = new UserService();