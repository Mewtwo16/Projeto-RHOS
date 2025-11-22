import bcrypt from 'bcrypt'
import db from '../db/db'
import logService from './logService'
import { addUser, AnyResponse, AuthUser } from '../types'

class UserService {
  async addUser(userData: addUser, loggedUser?: AuthUser): Promise<AnyResponse> {
    try {
      const senhaHash = await bcrypt.hash(userData.password, 10)
      
      await db.transaction(async (trx) => {
        const [newUserID] = await trx('users').insert({
          full_name: userData.full_name,
          email: userData.email,
          cpf: userData.cpf,
          birth_date: userData.birth_date,
          login: userData.user,
          password_hash: senhaHash,
          status: userData.status,
          creation_date: new Date()
        })

        const role = await trx('profiles').where({ profile_name: userData.role }).first()
        if (!role) throw new Error(`Cargo '${userData.role}' não encontrado`)

        await trx('profile_users').insert({
          users_id: newUserID,
          profile_id: role.id
        })

        await logService.write({
          user_id: loggedUser?.id || null,
          who: loggedUser?.usuario || 'system',
          where: 'users',
          what: `Criou usuário ${userData.user} com cargo ${userData.role}`
        }, trx)
      })

      return { success: true, message: 'Usuário criado com sucesso' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao criar usuário' }
    }
  }

  async showUser(options: {
    id?: number
    full_name?: string
    email?: string
    login?: string
    cpf?: string
    role?: string
  }) {
    try {
      const query = db('users as u')
        .leftJoin('profile_users as pu', 'pu.users_id', 'u.id')
        .leftJoin('profiles as p', 'p.id', 'pu.profile_id')
        .select(
          'u.id',
          'u.full_name',
          'u.email',
          'u.login',
          'u.cpf',
          'u.birth_date',
          'u.status',
          db.raw('COALESCE(p.profile_name, "") as role')
        )

      if (options.id) query.where('u.id', options.id)
      else if (options.full_name) query.where('u.full_name', 'like', `%${options.full_name}%`)
      else if (options.email) query.where('u.email', 'like', `%${options.email}%`)
      else if (options.login) query.where('u.login', 'like', `%${options.login}%`)
      else if (options.cpf) query.where('u.cpf', 'like', `${options.cpf.replace(/\D+/g, '')}%`)
      else if (options.role) query.where('p.profile_name', 'like', `%${options.role}%`)
      else return null

      return await query.first()
    } catch (error) {
      throw new Error('Falha ao buscar usuário')
    }
  }

  async listAllUsers() {
    try {
      const users = await db('users as u')
        .leftJoin('profile_users as pu', 'pu.users_id', 'u.id')
        .leftJoin('profiles as p', 'p.id', 'pu.profile_id')
        .select(
          'u.id',
          'u.full_name',
          'u.email',
          'u.login',
          'u.cpf',
          'u.birth_date',
          'u.status',
          'u.creation_date',
          db.raw('COALESCE(p.profile_name, "") as role')
        )
        .orderBy('u.full_name', 'asc')

      return users
    } catch (error) {
      throw new Error('Falha ao listar usuários')
    }
  }

  async updateUser(userId: number, userData: Partial<addUser>, loggedUser?: AuthUser): Promise<AnyResponse> {
    try {
      await db.transaction(async (trx) => {
        const existingUser = await trx('users').where({ id: userId }).first()
        if (!existingUser) {
          throw new Error('Usuário não encontrado')
        }

        const updateData: any = {}
        
        if (userData.full_name) updateData.full_name = userData.full_name
        if (userData.email) updateData.email = userData.email
        if (userData.cpf) updateData.cpf = userData.cpf
        if (userData.birth_date) updateData.birth_date = userData.birth_date
        if (userData.status !== undefined) updateData.status = userData.status
        
        if (userData.password) {
          const senhaHash = await bcrypt.hash(userData.password, 10)
          updateData.password_hash = senhaHash
        }

        if (Object.keys(updateData).length > 0) {
          await trx('users').where({ id: userId }).update(updateData)
        }

        if (userData.role) {
          const role = await trx('profiles').where({ profile_name: userData.role }).first()
          if (!role) throw new Error(`Cargo '${userData.role}' não encontrado`)

          await trx('profile_users').where({ users_id: userId }).delete()

          await trx('profile_users').insert({
            users_id: userId,
            profile_id: role.id
          })
        }

        await logService.write({
          user_id: loggedUser?.id || null,
          who: loggedUser?.usuario || 'system',
          where: 'users',
          what: `Atualizou usuário ${userData.user || existingUser.login}`
        }, trx)
      })

      return { success: true, message: 'Usuário atualizado com sucesso' }
    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao atualizar usuário' }
    }
  }
}

export default new UserService()
