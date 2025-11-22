import { Request, Response } from 'express'
import logService from '../services/logService'

export async function getLogsRoute(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    const result = await logService.list(limit)
    
    if (result.success) {
      return res.json({ success: true, data: result.data })
    }
    
    return res.status(500).json({ 
      success: false, 
      message: result.error || 'Falha ao listar logs' 
    })
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error?.message || 'Erro ao buscar logs' 
    })
  }
}
