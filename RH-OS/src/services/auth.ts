const bcrypt = require('bcrypt');
import type { Knex } from 'knex';
const db = require('../db/db') as Knex;

import type { RespostaLogin } from '../types';

async function login(usuario: string, senha: string): Promise<RespostaLogin> {
  try {
    const user = await db('users').where({ login: usuario }).first();
    if (user && user.status === 1 && await bcrypt.compare(senha, user.password_hash)) {
      return { success: true, message: 'Login bem-sucedido!', userId: user.id };
    } else {
      return { success: false, message: 'Usuário ou senha inválidos' };
    }
  } catch (error) {
    console.error('[Main IPC Error]:', error);
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
}

module.exports = { login };