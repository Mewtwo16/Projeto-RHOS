import logService from './logService'
import db from '../db/db'
import type { Profile, addProfile, AnyResponse, AuthUser } from '../types'

class ProfileService {
  async addProfile(profileData: addProfile, loggedUser?: AuthUser): Promise<AnyResponse> {
    try {
      const result = await db.transaction(async (trx) => {
        const [profileId] = await trx('profiles').insert({
          profile_name: profileData.profile_name,
          description: profileData.description || null
        })

        const permissions = profileData.permissions || []
        const assigned: string[] = []

        for (const perm of permissions) {
          let allowed = await trx('allowed').where({ permission_name: perm }).first()
          
          if (!allowed) {
            const [newId] = await trx('allowed').insert({ permission_name: perm })
            allowed = { id: newId, permission_name: perm }
          }

          const exists = await trx('profile_permissions')
            .where({ profile_id: profileId, permission_id: allowed.id })
            .first()

          if (!exists) {
            await trx('profile_permissions').insert({ 
              profile_id: profileId, 
              permission_id: allowed.id 
            })
            assigned.push(perm)
          }
        }

        await logService.write({
          user_id: loggedUser?.id || null,
          who: loggedUser?.usuario || 'system',
          where: 'profiles',
          what: `Criou cargo ${profileData.profile_name} com ${assigned.length} permissões`
        }, trx)

        return { profileId, assigned }
      })

      return {
        success: true,
        message: `Cargo criado com ${result.assigned.length} permissões`
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao criar cargo'
      }
    }
  }

  async searchProfiles(options: { 
    id?: number
    profile_name?: string
    description?: string 
  }): Promise<AnyResponse> {
    try {
      const query = db('profiles as p')
        .select('p.id', 'p.profile_name', 'p.description')

      if (options.id) {
        query.where('p.id', options.id)
      } else if (options.profile_name) {
        query.where('p.profile_name', 'like', `%${options.profile_name}%`)
      } else if (options.description) {
        query.where('p.description', 'like', `%${options.description}%`)
      } else {
        return { success: false, message: 'Parâmetro de busca inválido' }
      }

      const profile = await query.first()
      if (!profile) return { success: true, data: null }

      const permissions = await db('allowed as a')
        .join('profile_permissions as ra', 'ra.permission_id', 'a.id')
        .where('ra.profile_id', profile.id)
        .distinct('a.permission_name')
        .pluck('permission_name')

      return { 
        success: true, 
        data: { ...profile, permissions } 
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar cargo'
      }
    }
  }

  async listAllProfiles(): Promise<AnyResponse> {
    try {
      const profiles = await db('profiles')
        .select('id', 'profile_name', 'description')
        .orderBy('profile_name', 'asc')

      const profilesWithPermissions = await Promise.all(
        profiles.map(async (profile) => {
          const permissions = await db('allowed as a')
            .join('profile_permissions as ra', 'ra.permission_id', 'a.id')
            .where('ra.profile_id', profile.id)
            .distinct('a.permission_name')
            .pluck('permission_name')
          
          return { ...profile, permissions }
        })
      )

      return { success: true, data: profilesWithPermissions }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao listar cargos'
      }
    }
  }

  async updateProfile(profileId: number, profileData: Partial<addProfile>, loggedUser?: AuthUser): Promise<AnyResponse> {
    try {
      const result = await db.transaction(async (trx) => {
        const existingProfile = await trx('profiles').where({ id: profileId }).first()
        if (!existingProfile) {
          throw new Error('Cargo não encontrado')
        }

        if (profileData.description !== undefined) {
          await trx('profiles')
            .where({ id: profileId })
            .update({ description: profileData.description })
        }

        let assigned: string[] = []
        if (profileData.permissions) {
          await trx('profile_permissions').where({ profile_id: profileId }).delete()

          for (const perm of profileData.permissions) {
            let allowed = await trx('allowed').where({ permission_name: perm }).first()
            
            if (!allowed) {
              const [newId] = await trx('allowed').insert({ permission_name: perm })
              allowed = { id: newId, permission_name: perm }
            }

            await trx('profile_permissions').insert({ 
              profile_id: profileId, 
              permission_id: allowed.id 
            })
            assigned.push(perm)
          }
        }

        await logService.write({
          user_id: loggedUser?.id || null,
          who: loggedUser?.usuario || 'system',
          where: 'profiles',
          what: `Atualizou cargo ${existingProfile.profile_name} com ${assigned.length} permissões`
        }, trx)

        return { assigned }
      })

      return {
        success: true,
        message: `Cargo atualizado com sucesso`
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao atualizar cargo'
      }
    }
  }
}

export default new ProfileService()
