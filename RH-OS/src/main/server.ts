import express from 'express'
import cors from 'cors'
import router from './router'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.EXPRESS_PORT ?? 3000

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4040'], // Vite dev server e Electron
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(router)

app.listen(port, () => {
  console.log(`Servidor online na porta ${port}`)
})

export default app
