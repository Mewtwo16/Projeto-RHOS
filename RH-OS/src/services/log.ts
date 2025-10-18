import type { Knex } from 'knex';
const db = require('../db/db') as Knex;

export interface EntradaLog {
  user_id?: number | null;
  username?: string | null;
  action: string;
  resource?: string | null;
  resource_id?: number | null;
  details?: string | null;
}

class ServicoLogs {
  async registrar(entry: EntradaLog, trx?: Knex.Transaction) {
    try {
      const q = trx ? trx('logs') : db('logs');
      await q.insert({
        user_id: entry.user_id || null,
        username: entry.username || null,
        action: entry.action,
        resource: entry.resource || null,
        resource_id: entry.resource_id || null,
        details: entry.details || null,
      });
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar log:', err);
      return { success: false, error: String(err) };
    }
  }

  async listar(limit = 200) {
    try {
      const rows = await db('logs').select('*').orderBy('created_at', 'desc').limit(limit);
      console.debug('[ServicoLogs] listar: rows.length=', Array.isArray(rows) ? rows.length : 'not-array', rows && rows[0]);
      return { success: true, data: rows };
    } catch (err) {
      console.error('Erro ao listar logs:', err);
      return { success: false, error: String(err) };
    }
  }
}

module.exports = new ServicoLogs();
