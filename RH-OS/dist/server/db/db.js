"use strict";
// Conexão centralizada com o banco de dados
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require('knex');
const configuration = require('../knexfile');
const db = knex(configuration.development);
module.exports = db;
//# sourceMappingURL=db.js.map