const knex = require('knex');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

import type { Knex as KnexType } from 'knex';
import type { RespostaLogin } from '../types';

dotenv.config();

const knexConfig = require('../knexfile');
const db: KnexType = knex(knexConfig.development);

async function login(usuario: string, senha: string): Promise<RespostaLogin> {
     try {
    const user = await db('usuarios').where({ login: usuario }).first();
    if (user && bcrypt.compare(senha, user.senha_hash)) {
      return { success: true, message: 'Login bem-sucedido!' };
    } else {
      return { success: false, message: 'Usuário ou senha inválidos' };
    }
  } catch (error) {
    console.error('[Main IPC Error]:', error);
    return { success: false, message: 'Erro de comunicação com o servidor.' };
  }
};

module.exports = {
    login,
    db
};