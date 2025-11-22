import { Request, Response } from 'express'
import health from '../services/healthService'

export async function healthRoute(req: Request, res: Response) {
  try {
    const healthResponse = await health.tryDB()
    return res.status(200).json({ status: 'ok' })
  } catch (error: any) {
    return res
      .status(500)
      .json({ status: 'error', message: error?.message ?? 'DB connection failed' })
  }
}
