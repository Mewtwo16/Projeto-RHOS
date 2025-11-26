import knex from 'knex'
import dotenv from 'dotenv'
import type { Knex } from 'knex'
import path from 'path'
import { app } from 'electron'

// Carregar .env do diretório correto
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '../../../.env')

dotenv.config({ path: envPath })

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
