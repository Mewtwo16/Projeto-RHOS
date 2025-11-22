import { Router, Response } from 'express'
import employeeService from '../services/employeeService'
import logService from '../services/logService'
import { AuthRequest } from '../types'
import { addEmployeeSchema, updateEmployeeSchema, employeeIsValid } from '../middlewares/addEmployeeValidate'

const router = Router()

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const funcionarios = await employeeService.listarFuncionarios(status)
    
    res.json({
      success: true,
      data: funcionarios
    })
  } catch (error) {
    console.error('Erro ao listar funcionários:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao listar funcionários'
    })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const funcionario = await employeeService.buscarFuncionarioPorId(id)
    
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      })
    }
    
    res.json({
      success: true,
      data: funcionario
    })
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar funcionário'
    })
  }
})

router.post('/', employeeIsValid(addEmployeeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, cpf } = req.body
    
    // Verifica se CPF já existe
    const existente = await employeeService.buscarFuncionarioPorCPF(cpf)
    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'CPF já cadastrado'
      })
    }
    
    const id = await employeeService.criarFuncionario(req.body)
    
    await logService.write({
      user_id: req.user?.id,
      who: req.user?.usuario || 'Sistema',
      where: 'Funcionários',
      what: `Cadastrou o funcionário: ${full_name}`
    })
    
    res.status(201).json({
      success: true,
      message: 'Funcionário cadastrado com sucesso',
      data: { id }
    })
  } catch (error) {
    console.error('Erro ao criar funcionário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao criar funcionário'
    })
  }
})

router.put('/:id', employeeIsValid(updateEmployeeSchema), async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const funcionario = await employeeService.buscarFuncionarioPorId(id)
    
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      })
    }
    
    const sucesso = await employeeService.atualizarFuncionario(id, req.body)
    
    if (sucesso) {
      await logService.write({
        user_id: req.user?.id,
        who: req.user?.usuario || 'Sistema',
        where: 'Funcionários',
        what: `Atualizou o funcionário: ${funcionario.full_name}`
      })
      
      res.json({
        success: true,
        message: 'Funcionário atualizado com sucesso'
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Nenhuma alteração realizada'
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar funcionário'
    })
  }
})

router.get('/:id/calcular', async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id)
    const calculo = await employeeService.calcularFolhaPagamento(id)
    
    res.json({
      success: true,
      data: calculo
    })
  } catch (error) {
    console.error('Erro ao calcular folha:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao calcular folha'
    })
  }
})

router.get('/stats/geral', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await employeeService.obterEstatisticas()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas'
    })
  }
})

router.get('/relatorio/consolidado', async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const funcionarios = await employeeService.listarFuncionarios(status)
    
    const relatorio = []
    
    for (const func of funcionarios) {
      const calculo = await employeeService.calcularFolhaPagamento(func.id)
      relatorio.push({
        nome: func.full_name,
        cpf: func.cpf,
        cargo: func.position_name,
        status: func.status,
        salario_bruto: calculo.salarioBruto,
        inss: calculo.inss,
        irrf: calculo.irrf,
        transportation_voucher: calculo.valeTransporteDesc,
        total_descontos: calculo.totalDescontos,
        salario_liquido: calculo.salarioLiquido,
        encargos_patronais: calculo.totalEncargos,
        custo_total: calculo.custoTotal
      })
    }
    
    res.json({
      success: true,
      data: relatorio,
      totalizadores: {
        total_funcionarios: relatorio.length,
        total_salarios_brutos: relatorio.reduce((acc, f) => acc + f.salario_bruto, 0),
        total_descontos: relatorio.reduce((acc, f) => acc + f.total_descontos, 0),
        total_salarios_liquidos: relatorio.reduce((acc, f) => acc + f.salario_liquido, 0),
        total_encargos: relatorio.reduce((acc, f) => acc + f.encargos_patronais, 0),
        custo_total_empresa: relatorio.reduce((acc, f) => acc + f.custo_total, 0)
      }
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório consolidado'
    })
  }
})

export default router
