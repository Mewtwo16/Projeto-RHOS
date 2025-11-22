import { Router, Response } from 'express'
import positionService from '../services/positionService'
import logService from '../services/logService'
import { AuthRequest } from '../types'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const apenasAtivos = req.query.actives !== 'false'
    const cargos = await positionService.listarCargos(apenasAtivos)
    
    res.json({
      success: true,
      data: cargos
    })
  } catch (error) {
    console.error('Erro ao listar cargos:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao listar cargos'
    })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const cargo = await positionService.buscarCargoPorId(id)
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo não encontrado'
      })
    }
    
    res.json({
      success: true,
      data: cargo
    })
  } catch (error) {
    console.error('Erro ao buscar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cargo'
    })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { position_name, description, base_salary, weekly_hours, level, department } = req.body
    
    if (!position_name || !base_salary) {
      return res.status(400).json({
        success: false,
        message: 'Nome do cargo e salário base são obrigatórios'
      })
    }
    
    const id = await positionService.criarCargo(req.body)
    
    await logService.write({
      user_id: req.user?.id,
      who: req.user?.usuario || 'Sistema',
      where: 'Cargos CLT',
      what: `Criou o cargo: ${position_name}`
    })
    
    res.status(201).json({
      success: true,
      message: 'Cargo criado com sucesso',
      data: { id }
    })
  } catch (error) {
    console.error('Erro ao criar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cargo'
    })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const cargo = await positionService.buscarCargoPorId(id)
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo não encontrado'
      })
    }
    
    const sucesso = await positionService.atualizarCargo(id, req.body)
    
    if (sucesso) {
      await logService.write({
        user_id: req.user?.id,
        who: req.user?.usuario || 'Sistema',
        where: 'Cargos CLT',
        what: `Atualizou o cargo: ${cargo.position_name}`
      })
      
      res.json({
        success: true,
        message: 'Cargo atualizado com sucesso'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Nenhuma alteração realizada'
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cargo'
    })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const cargo = await positionService.buscarCargoPorId(id)
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo não encontrado'
      })
    }
    
    const emUso = await positionService.cargoEmUso(id)
    if (emUso) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar. Cargo está vinculado a funcionários ativos'
      })
    }
    
    const sucesso = await positionService.deletarCargo(id)
    
    if (sucesso) {
      await logService.write({
        user_id: req.user?.id,
        who: req.user?.usuario || 'Sistema',
        where: 'Cargos CLT',
        what: `Deletou o cargo: ${cargo.position_name}`
      })
      
      res.json({
        success: true,
        message: 'Cargo deletado com sucesso'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro ao deletar cargo'
      })
    }
  } catch (error) {
    console.error('Erro ao deletar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar cargo'
    })
  }
})

export default router
