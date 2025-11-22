import knex from 'knex'
import dotenv from 'dotenv'
import type { Knex } from 'knex'

dotenv.config()

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT!),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!
    }
  }
}

const db = knex(config.development)

export default db
