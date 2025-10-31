"use strict";
/*
    knexfile.ts
    - Configuração do Knex para diferentes ambientes (aqui usamos 'development').
    - As credenciais são carregadas do arquivo .env.
*/
Object.defineProperty(exports, "__esModule", { value: true });
// requires e imports
const path = require('path');
const dotenv = require('dotenv');
// Carrega as variáveis do .env 
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const config = {
    development: {
        client: 'mysql2',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './db/migrations'
        }
    }
};
module.exports = config;
//# sourceMappingURL=knexfile.js.map