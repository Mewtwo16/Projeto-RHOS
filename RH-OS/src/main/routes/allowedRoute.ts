import { Request, Response } from 'express'
import allowedService from '../services/allowedService'

export async function getAllowedRoute(_req: Request, res: Response) {
  try {
    const r = await allowedService.listAll()
    if (!r.success) return res.status(500).json(r)
    return res.json(r)
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message || String(error) })
  }
}
