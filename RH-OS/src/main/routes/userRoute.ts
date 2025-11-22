import { Response } from 'express'
import { AuthRequest } from '../types'
import userService from '../services/userService'

export async function addUserRoute(req: AuthRequest, res: Response) {
  try {
    const userData = req.body
    const loggedUser = req.user
    
    const userResponse = await userService.addUser(userData, loggedUser)

    if (userResponse.success) {
      res.json({
        success: true,
        message: `Sucesso na criação do usuario!`
      })
    } else {
      res.status(400).json(userResponse)
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || error })
  }
}

export async function getUserRoute(req: AuthRequest, res: Response) {
  try {
    const { id, full_name, email, login, cpf, role } = req.query

    const provided = [id, full_name, email, login, cpf, role].filter((v) => v !== undefined)
    
    if (provided.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Informe um parâmetro de busca: id, full_name, email, login, cpf ou role.'
      })
    }
    
    if (provided.length > 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Informe apenas um parâmetro de busca por requisição.' 
      })
    }

    const opts: any = {}
    if (id && !isNaN(Number(id))) opts.id = Number(id)
    else if (typeof full_name === 'string') opts.full_name = full_name
    else if (typeof email === 'string') opts.email = email
    else if (typeof login === 'string') opts.login = login
    else if (typeof cpf === 'string') opts.cpf = cpf
    else if (typeof role === 'string') opts.role = role

    const user = await userService.showUser(opts)
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
    
    res.json({ success: true, data: user })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || error })
  }
}

export async function listUsersRoute(req: AuthRequest, res: Response) {
  try {
    const users = await userService.listAllUsers()
    res.json({ success: true, data: users })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || error })
  }
}

export async function updateUserRoute(req: AuthRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id, 10)
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const userData = req.body
    const loggedUser = req.user
    
    const userResponse = await userService.updateUser(userId, userData, loggedUser)

    if (userResponse.success) {
      res.json({
        success: true,
        message: userResponse.message || 'Usuário atualizado com sucesso.'
      })
    } else {
      res.status(400).json(userResponse)
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || error })
  }
}
