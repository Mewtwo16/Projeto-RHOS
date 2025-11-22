import authService from '../services/authService'
import { Request, Response } from 'express'

export async function loginRoute(req: Request, res: Response) {
  try {
    const { usuario, senha } = req.body
    const loginResponse = await authService.login(usuario, senha)

    if (loginResponse.success) {
      res.json({
        success: true,
        message: loginResponse.message,
        token: loginResponse.token
      })
    } else {
      res.status(401).json(loginResponse)
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
