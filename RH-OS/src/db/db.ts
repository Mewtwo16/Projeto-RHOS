// Conexão centralizada com o banco de dados

const knex = require('knex');
const configuration = require('../knexfile'); 

const db = knex(configuration.development);

module.exports = db;