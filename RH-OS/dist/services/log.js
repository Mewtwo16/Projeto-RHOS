"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db = require('../db/db');
class LogsService {
    async writeLogs(entry, trx) {
        try {
            const q = trx ? trx('audit_logs') : db('audit_logs');
            const detailsObj = {};
            if (entry.username)
                detailsObj.username = entry.username;
            if (entry.details)
                detailsObj.details = entry.details;
            await q.insert({
                users_id: entry.user_id || null,
                action: entry.action,
                resource: entry.resource || null,
                resource_id: entry.resource_id || null,
                details: Object.keys(detailsObj).length ? JSON.stringify(detailsObj) : null,
            });
            return { success: true };
        }
        catch (err) {
            console.error('Erro ao registrar log:', err);
            return { success: false, error: String(err) };
        }
    }
    async listLogs(limit = 200) {
        try {
            const rows = await db('audit_logs').select('*').orderBy('created_at', 'desc').limit(limit);
            const normalized = rows.map((r) => {
                let username = null;
                let detailsStr = null;
                if (r.details) {
                    try {
                        const d = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
                        username = d?.username ?? null;
                        detailsStr = d?.details ?? (typeof d === 'object' ? JSON.stringify(d) : String(d));
                    }
                    catch {
                        detailsStr = String(r.details);
                    }
                }
                return {
                    id: r.id,
                    user_id: r.users_id,
                    action: r.action,
                    resource: r.resource ?? null,
                    resource_id: r.resource_id ?? null,
                    created_at: r.created_at,
                    username,
                    details: detailsStr,
                };
            });
            console.debug('[ServicoLogs] listar: rows.length=', Array.isArray(rows) ? rows.length : 'not-array', rows && rows[0]);
            return { success: true, data: normalized };
        }
        catch (err) {
            console.error('Erro ao listar logs:', err);
            return { success: false, error: String(err) };
        }
    }
}
module.exports = new LogsService();
//# sourceMappingURL=log.js.map