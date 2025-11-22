import type { Knex } from 'knex'
import db from '../db/db'
import { LogEntry } from '../types'



class LogService {
  async write(entry: LogEntry, trx?: Knex.Transaction) {
    try {
      const query = trx ? trx('audit_logs') : db('audit_logs')

      await query.insert({
        user_id: entry.user_id || null,
        who: entry.who || null,
        where: entry.where,
        what: entry.what
      })

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  async list(limit?: number) {
    try {
      const query = db('audit_logs')
        .select('id', 'user_id', 'who', 'where', 'when', 'what')
        .orderBy('when', 'desc')

      const logs = limit ? await query.limit(limit) : await query

      return { success: true, data: logs }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export default new LogService()
