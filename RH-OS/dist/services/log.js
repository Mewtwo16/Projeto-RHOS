"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../db/db');
class ServicoLogs {
    async registrar(entry, trx) {
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
        }
        catch (err) {
            console.error('Erro ao registrar log:', err);
            return { success: false, error: String(err) };
        }
    }
    async listar(limit = 200) {
        try {
            const rows = await db('logs').select('*').orderBy('created_at', 'desc').limit(limit);
            console.debug('[ServicoLogs] listar: rows.length=', Array.isArray(rows) ? rows.length : 'not-array', rows && rows[0]);
            return { success: true, data: rows };
        }
        catch (err) {
            console.error('Erro ao listar logs:', err);
            return { success: false, error: String(err) };
        }
    }
}
module.exports = new ServicoLogs();
//# sourceMappingURL=log.js.map