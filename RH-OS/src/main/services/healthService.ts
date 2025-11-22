import db from '../db/db'

class Health {
  async tryDB(): Promise<void> {
    await db.raw('select 1')
  }
}

export default new Health()
