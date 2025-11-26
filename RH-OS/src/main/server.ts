import express from 'express'
import cors from 'cors'
import router from './router'
import dotenv from 'dotenv'
import path from 'path'
import { app, dialog } from 'electron'
import fs from 'fs'

// Carregar .env do diretório correto
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '../../.env')

const envExamplePath = app.isPackaged
  ? path.join(process.resourcesPath, '.env.example')
  : path.join(__dirname, '../../.env.example')

// Verificar se .env existe, se não, tentar copiar do .env.example
if (app.isPackaged && !fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath)
      dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Configuração Inicial',
        message: 'Arquivo .env criado a partir do .env.example',
        detail: `Por favor, configure suas credenciais do banco de dados em:\n${envPath}\n\nApós configurar, reinicie a aplicação.`
      })
    } catch (error) {
      dialog.showErrorBox(
        'Erro de Configuração',
        `Não foi possível criar o arquivo .env. Por favor, copie manualmente o arquivo .env.example para .env em:\n${process.resourcesPath}`
      )
    }
  } else {
    dialog.showErrorBox(
      'Erro de Configuração',
      `Arquivo .env.example não encontrado. Por favor, crie um arquivo .env em:\n${process.resourcesPath}`
    )
  }
}

dotenv.config({ path: envPath })

console.log('Carregando .env de:', envPath)
console.log('DB_HOST:', process.env.DB_HOST)
console.log('EXPRESS_PORT:', process.env.EXPRESS_PORT)

const expressApp = express()
const port = Number(process.env.EXPRESS_PORT) || 4040

// Configuração do CORS - permite qualquer origem em produção (file://)
expressApp.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (file://, Electron) ou de localhost
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('file://')) {
      callback(null, true)
    } else {
      callback(null, true) // Em produção Electron, aceita qualquer origem
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

expressApp.use(router)

const server = expressApp.listen(port, '127.0.0.1', () => {
  console.log(`✓ Servidor Express iniciado na porta ${port}`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`✗ Porta ${port} já está em uso`)
    dialog.showErrorBox(
      'Erro ao Iniciar Servidor',
      `A porta ${port} já está em uso. Feche outros aplicativos que possam estar usando esta porta e reinicie o RH-OS.`
    )
  } else {
    console.error('✗ Erro ao iniciar servidor:', error)
    dialog.showErrorBox('Erro ao Iniciar Servidor', `Erro: ${error.message}`)
  }
})

export default expressApp
